import { ProductModule } from './modules/products/product.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    ProductModule,
    MongooseModule.forRoot('mongodb://localhost:27017/node-challenge'),
  ],
})
export class AppModule {}
