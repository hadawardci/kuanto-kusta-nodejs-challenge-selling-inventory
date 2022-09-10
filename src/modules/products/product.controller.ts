import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { ReservationDto } from 'src/dtos/reserve.dto';
import { StockDto } from 'src/dtos/stock.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly _service: ProductService) {}

  @Patch(':id/stock')
  stock(
    @Param('id') id: string,
    @Body() request: StockDto,
    @Res() res: Response,
  ) {
    this._service.setStock(id, request);
    res.status(HttpStatus.OK).send();
  }

  @Get(':id')
  state(@Param('id') id: string) {
    return this._service.getState(id);
  }

  @Post(':id/reserve')
  async reserve(@Param('id') id: string) {
    return this._service.reserveItem(id);
  }

  @Post(':id/unreserve')
  async unreserve(
    @Param('id') id: string,
    @Body() request: ReservationDto,
    @Res() res: Response,
  ) {
    await this._service.unreserveItem(id, request);
    res.status(HttpStatus.OK).send();
  }

  @Post(':id/sold')
  async sold(
    @Param('id') id: string,
    @Body() request: ReservationDto,
    @Res() res: Response,
  ) {
    await this._service.sold(id, request);
    res.status(HttpStatus.OK).send();
  }
}
