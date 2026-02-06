import { Controller, UseGuards, Request, Get, Post, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role.guard';
import { UserService } from './user.service';

@Controller('api/v1/user')
@UseGuards(AuthGuard('jwt'), new RoleGuard('user'))
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Get('tasks')    
    async getMyTasks(@Request() req) {
        const userId = req.user._id;
        return await this.userService.getUserTasks(userId);
    }

    @Post('tasks/status/:taskId')
    async changeTaskStatus(@Request() req, @Param('taskId') taskId: string) {
        const { status } = req.body;
        return await this.userService.changeStatusOfTask(taskId, status);
    }
}
