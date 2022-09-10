import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const StockLevel = {
  IN_STOCK: 'IN_STOCK',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
} as const;

export type StockLevelType = typeof StockLevel[keyof typeof StockLevel];

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, type: String })
  productId: string;

  @Prop({ required: true, type: String })
  stockLevel: StockLevelType;

  @Prop({ type: String })
  reservationToken?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

