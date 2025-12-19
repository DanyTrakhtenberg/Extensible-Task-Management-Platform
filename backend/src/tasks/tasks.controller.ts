import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(
      createTaskDto.taskTypeId,
      createTaskDto.assignedUserId,
    );
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return this.tasksService.changeStatus(
      +id,
      changeStatusDto.newStatus,
      changeStatusDto.nextAssignedUserId,
      changeStatusDto.customFields,
    );
  }

  @Patch(':id/close')
  async closeTask(@Param('id') id: string) {
    return this.tasksService.closeTask(+id);
  }

  @Get('user/:userId')
  async getUserTasks(@Param('userId') userId: string) {
    return this.tasksService.getUserTasks(+userId);
  }

  @Get()
  async findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }
}

