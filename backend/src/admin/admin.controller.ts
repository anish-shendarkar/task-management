import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RoleGuard } from 'src/role.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), new RoleGuard('admin'))
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
    ) {}

    @Post('task/assign/:userId')
    async createAndAssignTask(
        @Param('userId') userId: string,
        @Body() body: any,
    ) {
        return this.adminService.createAndAssignTask(userId, body.title, body.description);
    }
}
