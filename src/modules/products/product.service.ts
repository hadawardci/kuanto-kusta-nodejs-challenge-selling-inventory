import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ReservationDto } from 'src/dtos/reserve.dto';
import {
  Product,
  ProductDocument,
  StockLevel,
} from 'src/schemas/product.schema';
import { StockDto } from 'src/dtos/stock.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private _productModel: Model<ProductDocument>,
  ) {}

  async setStock(productId: string, stockDto: StockDto) {
    const session = await this._productModel.startSession();
    try {
      await session.withTransaction(async (_) => {
        await this._productModel.deleteMany({
          productId,
          stockLevel: StockLevel.IN_STOCK,
        });

        const producsInStock = Array.from(
          { length: stockDto.stock },
          () =>
            new this._productModel({
              productId,
              stockLevel: StockLevel.IN_STOCK,
            }),
        );

        await this._productModel.bulkSave(producsInStock);
      });
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async getState(productId: string) {
    const stockState = await this._productModel
      .aggregate()
      .match({ productId })
      .group({
        _id: '$stockLevel',
        count: { $sum: 1 },
      });

    if (stockState.length === 0) throw new NotFoundException();
    return stockState.reduce(
      (acc, value) => {
        acc[value._id] = value.count;
        return acc;
      },
      { IN_STOCK: 0, RESERVED: 0, SOLD: 0 },
    );
  }

  async reserveItem(productId: string) {
    const session = await this._productModel.startSession();
    let response: ReservationDto = null;
    try {
      await session.withTransaction(async (_) => {
        const product = await this._productModel.findOne({
          productId,
          stockLevel: StockLevel.IN_STOCK,
        });
        if (product === null)
          throw new BadRequestException('Product Unavailable');

        response = {
          reservationToken: uuidv4(),
        };

        await this._productModel.updateOne(
          {
            productId,
            stockLevel: StockLevel.IN_STOCK,
          },
          {
            stockLevel: StockLevel.RESERVED,
            reservationToken: response.reservationToken,
          },
        );
      });
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
    return response;
  }

  async unreserveItem(productId: string, reservation: ReservationDto) {
    const session = await this._productModel.startSession();
    try {
      await session.withTransaction(async (_) => {
        const product = await this._productModel.findOne({
          productId,
          stockLevel: StockLevel.RESERVED,
          reservationToken: reservation.reservationToken,
        });
        if (product === null)
          throw new BadRequestException('ReservationToken expired');

        await this._productModel.updateOne(
          {
            productId,
            reservationToken: reservation.reservationToken,
          },
          {
            stockLevel: StockLevel.IN_STOCK,
            reservationToken: null,
          },
        );
      });
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async sold(productId: string, reservation: ReservationDto) {
    const session = await this._productModel.startSession();
    try {
      await session.withTransaction(async (_) => {
        const product = await this._productModel.findOne({
          productId,
          stockLevel: StockLevel.RESERVED,
          reservationToken: reservation.reservationToken,
        });
        if (product === null)
          throw new BadRequestException('ReservationToken expired');

        await this._productModel.updateOne(
          {
            productId,
            reservationToken: reservation.reservationToken,
          },
          {
            stockLevel: StockLevel.SOLD,
            reservationToken: null,
          },
        );
      });
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
