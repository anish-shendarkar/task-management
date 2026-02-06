import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Task } from 'src/schemas/task.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Task') private readonly taskModel: Model<Task>,
        @InjectConnection() private readonly connection: Connection,
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

    async getAllTasks() {
        return await this.taskModel.find().populate('assignedTo', 'name email');
    }

    async getTaskById(taskId: string) {
        const task = await this.taskModel.findById(taskId).populate('assignedTo', 'name email');
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        return task;
    }

    async updateTask(
        taskId: string,
        title?: string,
        description?: string,
        assignedTo?: string,
        status?: string,
    ) {
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        if (assignedTo !== undefined) {
            updateData.assignedTo = new Types.ObjectId(assignedTo);
        }

        if (status !== undefined) {
            const allowed = ['pending', 'in_progress', 'done'];
            if (!allowed.includes(status)) {
                throw new BadRequestException(`Invalid status: ${status}`);
            }
            updateData.status = status;
        }

        const task = await this.taskModel.findByIdAndUpdate(
            taskId,
            { $set: updateData },
            { new: true },
        );

        if (!task) {
            throw new NotFoundException('Task not found');
        }
        return task;
    }

    async deleteTask(taskId: string) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const task = await this.taskModel.findById(taskId).session(session);
            if (!task) {
                throw new NotFoundException('Task not found');
            }

            await this.userModel.updateMany(
                { tasks: taskId },
                { $pull: { tasks: taskId } },
                { session },
            );

            await this.taskModel.findByIdAndDelete(taskId).session(session);
            await session.commitTransaction();

            return { message: 'Task deleted successfully' };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getAllUsers(): Promise<User[]> {
        return await this.userModel.find({
            $where: 'this.role === "user"',
        }).select('-password').populate('tasks name');
    }

    async totalTaskCount() {
        return await this.taskModel.countDocuments();
    }

    async totalUserCount() {
        return await this.userModel.countDocuments();
    }
}