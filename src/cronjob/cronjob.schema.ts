import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class CronJob extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  link: string;

  @Prop({ default: null })
  apiKey?: string;

  @Prop({ required: true })
  schedule: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Webhook' }] })
  webhooks?: Types.Array<Types.ObjectId>;
}

export const CronJobSchema = SchemaFactory.createForClass(CronJob);
