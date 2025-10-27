import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; // Type cho model, giúp TypeScript biết đây là Mongo document.
import {
  IsString,
  IsDate,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  Min,
  Max,
} from 'class-validator'; // Import từ class-validator để thêm validation rules.

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Goal extends Document {
  @Prop({ type: String, required: true }) // UUID as string
  @IsString()
  user_id: string;

  @Prop({ required: true })
  @IsString()
  title: string;

  @Prop()
  @IsString()
  @IsOptional()
  description?: string;

  @Prop({ required: true })
  @IsDate()
  start_date: Date;

  @Prop()
  @IsDate()
  @IsOptional()
  end_date?: Date;

  @Prop({ default: 5 })
  @IsNumber()
  @Min(1)
  @Max(10)
  happiness_level: number;

  @Prop({ enum: ['active', 'completed', 'paused'], default: 'active' })
  @IsEnum(['active', 'completed', 'paused'])
  status: string;

  @Prop({ type: [{ date: Date, note: String, level: Number }] })
  @IsArray()
  @IsOptional()
  progress?: Array<{ date: Date; note?: string; level: number }>;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);

// Thêm index sau khi create schema (best practice để tránh type errors)
GoalSchema.index({ user_id: 1 });
