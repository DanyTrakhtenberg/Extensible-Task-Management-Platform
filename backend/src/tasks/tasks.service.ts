import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskStatusChange } from './task-status-change.entity';
import { WorkflowService } from './workflow.service';
import { TaskTypesService } from '../task-types/task-types.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskStatusChange)
    private statusChangesRepository: Repository<TaskStatusChange>,
    private workflowService: WorkflowService,
    private taskTypesService: TaskTypesService,
    private usersService: UsersService,
  ) {}

  /**
   * Create Task: Accept task type + initial assigned user
   */
  async createTask(
    taskTypeId: number,
    assignedUserId: number,
  ): Promise<Task> {
    const taskType = await this.taskTypesService.findOne(taskTypeId);
    if (!taskType) {
      throw new NotFoundException('Task type not found');
    }

    const user = await this.usersService.findOne(assignedUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = this.tasksRepository.create({
      taskTypeId,
      assignedUserId,
      status: 1, // All tasks start at status 1
      isClosed: false,
      customFields: JSON.stringify({}),
    });

    return this.tasksRepository.save(task);
  }

  /**
   * Change Status: Forward/backward with validations; assign next user; save custom fields
   */
  async changeStatus(
    taskId: number,
    newStatus: number,
    nextAssignedUserId: number,
    customFields: Record<string, any>,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['taskType', 'assignedUser'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Validate status change using workflow engine
    await this.workflowService.validateStatusChange(task, newStatus, customFields);

    // Validate next assigned user exists
    const nextUser = await this.usersService.findOne(nextAssignedUserId);
    if (!nextUser) {
      throw new NotFoundException('Next assigned user not found');
    }

    // Record status change history
    const statusChange = this.statusChangesRepository.create({
      taskId,
      fromStatus: task.status,
      toStatus: newStatus,
      assignedUserId: nextAssignedUserId,
    });
    await this.statusChangesRepository.save(statusChange);

    // Update task
    task.status = newStatus;
    task.assignedUserId = nextAssignedUserId;
    
    // Merge existing custom fields with new ones
    const existingFields = task.customFields ? JSON.parse(task.customFields) : {};
    task.customFields = JSON.stringify({ ...existingFields, ...customFields });
    task.updatedAt = new Date();

    return this.tasksRepository.save(task);
  }

  /**
   * Close Task: Only from final status
   */
  async closeTask(taskId: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Validate task closure using workflow engine
    await this.workflowService.validateTaskClosure(task);

    task.isClosed = true;
    task.updatedAt = new Date();

    return this.tasksRepository.save(task);
  }

  /**
   * Get User Tasks: Return tasks assigned to a user
   */
  async getUserTasks(userId: number): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assignedUserId: userId },
      relations: ['taskType', 'assignedUser'],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Get all tasks (for admin/debugging)
   */
  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['taskType', 'assignedUser'],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Get task by ID
   */
  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['taskType', 'assignedUser', 'statusChanges'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}

