import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';

@Controller('api/tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('list')
  async getList(Request, @Query('type') type: string) {
    const tasks = await this.tasksService.getTasks(Request.user.id, type ? parseInt(type) : undefined);
    return { success: true, data: tasks };
  }

  @Post('claim')
  async claim(Request, @Body() body: { taskId: number }) {
    const result = await this.tasksService.claim(Request.user.id, body.taskId);
    return result;
  }
}
