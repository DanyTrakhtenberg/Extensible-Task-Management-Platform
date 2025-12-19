import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskType } from './task-type.entity';

export interface StatusConfig {
  finalStatus: number;
  statusFields: { [status: number]: string[] }; // status -> array of field names
}

@Injectable()
export class TaskTypesService {
  constructor(
    @InjectRepository(TaskType)
    private taskTypesRepository: Repository<TaskType>,
  ) {}

  async findAll(): Promise<TaskType[]> {
    return this.taskTypesRepository.find();
  }

  async findOne(id: number): Promise<TaskType> {
    return this.taskTypesRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<TaskType> {
    return this.taskTypesRepository.findOne({ where: { name } });
  }

  async create(taskType: Partial<TaskType>): Promise<TaskType> {
    const newTaskType = this.taskTypesRepository.create(taskType);
    return this.taskTypesRepository.save(newTaskType);
  }

  getStatusConfig(taskType: TaskType): StatusConfig {
    return JSON.parse(taskType.statusConfig);
  }
}

