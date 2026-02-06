import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task {
    @Prop({ required: true })
    title: string;
    
    @Prop({ required: true })
    description: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    assignedTo: Types.ObjectId;

    @Prop({ required: true, enum: ['pending', 'in_progress', 'done'], default: 'pending' })
    status: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
