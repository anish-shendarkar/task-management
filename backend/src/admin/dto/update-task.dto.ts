import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsMongoId()
    assignedTo?: string;

    @IsOptional()
    @IsIn(['pending', 'in_progress', 'done'])
    status?: string;
}
