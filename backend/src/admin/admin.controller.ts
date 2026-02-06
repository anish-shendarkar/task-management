import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RoleGuard } from 'src/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('api/v1/admin')
@UseGuards(AuthGuard('jwt'), new RoleGuard('admin'))
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
    ) {}

    @Post('task/assign/:userId')
    async createAndAssignTask(
        @Param('userId') userId: string,
        @Body() createTaskDto: CreateTaskDto,
    ) {
        return this.adminService.createAndAssignTask(userId, createTaskDto);
    }

    @Get('tasks')
    async getAllTasks() {
        return this.adminService.getAllTasks();
    }

    @Get('task/:taskId')
    async getTaskById(@Param('taskId') taskId: string) {
        return this.adminService.getTaskById(taskId);
    }

    @Patch('task/:taskId')
    async updateTask(@Param('taskId') taskId: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.adminService.updateTask(taskId, updateTaskDto);
    }

    @Delete('task/:taskId')
    async deleteTask(@Param('taskId') taskId: string) {
        return this.adminService.deleteTask(taskId);
    }

    @Get('allusers')
    async getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Get('tasks/count')
    async totalTaskCount() {
        return this.adminService.totalTaskCount();
    }

    @Get('users/count')
    async totalUserCount() {
        return this.adminService.totalUserCount();
    }
}
