import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskType } from './task-type.entity';
import { TaskTypesService } from './task-types.service';
import { TaskTypesController } from './task-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskType])],
  providers: [TaskTypesService],
  controllers: [TaskTypesController],
  exports: [TaskTypesService],
})
export class TaskTypesModule {}

