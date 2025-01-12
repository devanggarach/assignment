import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'cronjob_histories', timestamps: true, versionKey: false })
export class CronJobHistory extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CronJob', required: true })
  cronJobId: string;

  @Prop({ type: Date, required: true })
  triggeredAt: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true }) // Explicitly define as Mixed type
  response: any;

  @Prop({ type: MongooseSchema.Types.Number, enum: [0, 1], required: true }) // 0: fail, 1: success
  status: number;
}

export const CronJobHistorySchema = SchemaFactory.createForClass(CronJobHistory);
