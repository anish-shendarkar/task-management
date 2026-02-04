import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from 'src/schemas/task.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Task') private readonly taskModel: Model<Task>,
    ) { }

    async createAndAssignTask(
        userId: string, 
        title: string, 
        description: string
    ): Promise<{ task: Task; user: User }> {
        // Verify user exists first
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create new task
        const newTask = new this.taskModel({
            title,
            description,
            assignedTo: userId,
        });
        const savedTask = await newTask.save();

        // Assign task to user
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { tasks: savedTask._id } },
            { new: true },
        );

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return {
            task: savedTask,
            user: updatedUser,
        };
    }
}