import { ApiPropertyOptional } from '@nestjs/swagger';
import { CouncilRole } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateCouncilMemberDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  lecturerId?: string;

  @ApiPropertyOptional({ enum: CouncilRole })
  @IsOptional()
  @IsEnum(CouncilRole)
  roleInCouncil?: CouncilRole;
}
