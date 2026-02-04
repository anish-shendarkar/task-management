import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from 'src/schemas/task.schema';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Task') private readonly taskModel: Model<Task>,
    ) { }

    async findUserByEmail(email: string): Promise<User | null> {
        return await this.userModel.findOne({ email });
    }

    async signUp(name: string, email: string, password: string, role: string): Promise<User> {
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new this.userModel({
                name,
                email,
                password: hashedPassword,
                role,
            });
            return await newUser.save();
        } catch (error) {
            throw new InternalServerErrorException('Error creating user');
        }
    }
}
