import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Task } from 'src/schemas/task.schema';
import { User } from 'src/schemas/user.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Task') private readonly taskModel: Model<Task>,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async createAndAssignTask(
        userId: string,
        createTaskDto: CreateTaskDto
    ): Promise<{ task: Task; user: User }> {
        // Verify user exists first
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create new task
        const newTask = new this.taskModel({
            title: createTaskDto.title,
            description: createTaskDto.description,
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
        updateTaskDto: UpdateTaskDto
    ) {
        const updateData: any = {};

        if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
        if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;

        if (updateTaskDto.assignedTo !== undefined) {
            const user = await this.userModel.findById(updateTaskDto.assignedTo);
            if (!user) throw new NotFoundException('Assigned user not found');

            updateData.assignedTo = new Types.ObjectId(updateTaskDto.assignedTo);
        }

        if (updateTaskDto.status !== undefined) {
            const allowed = ['pending', 'in_progress', 'done'];
            if (!allowed.includes(updateTaskDto.status)) {
                throw new BadRequestException(`Invalid status: ${updateTaskDto.status}`);
            }
            updateData.status = updateTaskDto.status;
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