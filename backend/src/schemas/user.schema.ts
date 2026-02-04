import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
    role: string;

    @Prop({ type: [Types.ObjectId], ref: 'Task' })
    tasks: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);