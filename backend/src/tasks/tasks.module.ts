import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatusChange } from './task-status-change.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { WorkflowService } from './workflow.service';
import { TaskTypesModule } from '../task-types/task-types.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskStatusChange]),
    TaskTypesModule,
    UsersModule,
  ],
  providers: [TasksService, WorkflowService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}

