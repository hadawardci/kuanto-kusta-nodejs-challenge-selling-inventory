import { ProductService } from './product.service';
import { ProductController } from './product.controller';

import { Module } from '@nestjs/common';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
