import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

    async signUp(name: string, email: string, password: string): Promise<User> {
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
            });
            return await newUser.save();
        } catch (error) {
            throw new InternalServerErrorException('Error creating user');
        }
    }

    async getUserTasks(userId: string) {
        const tasks = await this.taskModel.find({
            assignedUser: userId,
        }).populate('assignedTo', 'name email');
        console.log('getUserTasks', tasks);
        if (!tasks) {
            throw new NotFoundException('User not found');
        }
        return tasks;
    }

    async changeStatusOfTask(taskId: string, status: string): Promise<Task> {
        const task = await this.taskModel.findById(taskId);
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        const allowed = ['pending', 'in_progress', 'done'];
        if (!allowed.includes(status)) {
            throw new BadRequestException(`Invalid status: ${status}`);
        }
        task.status = status;
        return await task.save();
    }
}
