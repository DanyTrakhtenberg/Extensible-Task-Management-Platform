import { Controller, Get, Param } from '@nestjs/common';
import { TaskTypesService } from './task-types.service';

@Controller('task-types')
export class TaskTypesController {
  constructor(private readonly taskTypesService: TaskTypesService) {}

  @Get()
  async findAll() {
    return this.taskTypesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taskTypesService.findOne(+id);
  }
}

