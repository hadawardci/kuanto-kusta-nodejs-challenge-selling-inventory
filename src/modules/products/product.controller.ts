import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReservationDto } from 'src/dtos/reserve.dto';
import { StockDto } from 'src/dtos/stock.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly _service: ProductService) {}

  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  stock(@Param('id') id: string, @Body() request: StockDto) {
    this._service.setStock(id, request);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  state(@Param('id') id: string) {
    return this._service.getState(id);
  }

  @Post(':id/reserve')
  @HttpCode(HttpStatus.OK)
  async reserve(@Param('id') id: string) {
    const response = this._service.reserveItem(id);
    return response;
  }

  @Post(':id/unreserve')
  @HttpCode(HttpStatus.OK)
  async unreserve(@Param('id') id: string, @Body() request: ReservationDto) {
    await this._service.unreserveItem(id, request);
  }

  @Post(':id/sold')
  @HttpCode(HttpStatus.OK)
  async sold(@Param('id') id: string, @Body() request: ReservationDto) {
    await this._service.sold(id, request);
  }
}
