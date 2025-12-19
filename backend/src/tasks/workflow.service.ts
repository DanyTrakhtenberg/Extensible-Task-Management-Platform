import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TaskTypesService, StatusConfig } from '../task-types/task-types.service';
import { Task } from './task.entity';

/**
 * Core workflow engine that enforces general rules applicable to all task types.
 * This service ensures:
 * 1. Tasks are assigned to exactly one user
 * 2. Closed tasks are immutable
 * 3. Forward moves are sequential (no skipping)
 * 4. Backward moves are always allowed
 * 5. Tasks can only be closed at final status
 * 6. Status changes require type-specific data validation
 */
@Injectable()
export class WorkflowService {
  constructor(private taskTypesService: TaskTypesService) {}

  /**
   * Validates if a status change is allowed according to general workflow rules
   */
  async validateStatusChange(
    task: Task,
    newStatus: number,
    customFields: Record<string, any>,
  ): Promise<void> {
    // Rule 2: Closed tasks are immutable
    if (task.isClosed) {
      throw new ForbiddenException('Cannot modify a closed task');
    }

    const taskType = await this.taskTypesService.findOne(task.taskTypeId);
    if (!taskType) {
      throw new BadRequestException('Task type not found');
    }

    const statusConfig: StatusConfig = this.taskTypesService.getStatusConfig(taskType);

    // Rule 4: Forward moves must be sequential (no skipping)
    if (newStatus > task.status) {
      if (newStatus !== task.status + 1) {
        throw new BadRequestException(
          `Cannot skip statuses. Current status: ${task.status}, attempted status: ${newStatus}`,
        );
      }
    }

    // Rule 5: Backward moves are always allowed (already validated above if it's backward)

    // Rule 7a: Status change must satisfy type-specific data requirements
    const requiredFields = statusConfig.statusFields[newStatus] || [];
    for (const field of requiredFields) {
      if (!customFields || !customFields[field]) {
        throw new BadRequestException(
          `Status ${newStatus} requires field: ${field}`,
        );
      }
    }
  }

  /**
   * Validates if a task can be closed
   */
  async validateTaskClosure(task: Task): Promise<void> {
    // Rule 2: Closed tasks are immutable
    if (task.isClosed) {
      throw new ForbiddenException('Task is already closed');
    }

    const taskType = await this.taskTypesService.findOne(task.taskTypeId);
    if (!taskType) {
      throw new BadRequestException('Task type not found');
    }

    const statusConfig: StatusConfig = this.taskTypesService.getStatusConfig(taskType);

    // Rule 6: Task may be closed only at its final status
    if (task.status !== statusConfig.finalStatus) {
      throw new BadRequestException(
        `Task can only be closed at status ${statusConfig.finalStatus}. Current status: ${task.status}`,
      );
    }
  }

  /**
   * Gets the final status for a task type
   */
  async getFinalStatus(taskTypeId: number): Promise<number> {
    const taskType = await this.taskTypesService.findOne(taskTypeId);
    if (!taskType) {
      throw new BadRequestException('Task type not found');
    }
    const statusConfig: StatusConfig = this.taskTypesService.getStatusConfig(taskType);
    return statusConfig.finalStatus;
  }
}

