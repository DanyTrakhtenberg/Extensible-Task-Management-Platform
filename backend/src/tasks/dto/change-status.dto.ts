import { IsInt, IsNotEmpty, IsObject } from 'class-validator';

export class ChangeStatusDto {
  @IsInt()
  @IsNotEmpty()
  newStatus: number;

  @IsInt()
  @IsNotEmpty()
  nextAssignedUserId: number;

  @IsObject()
  customFields: Record<string, any>;
}

