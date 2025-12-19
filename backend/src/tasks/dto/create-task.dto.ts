import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsInt()
  @IsNotEmpty()
  taskTypeId: number;

  @IsInt()
  @IsNotEmpty()
  assignedUserId: number;
}

