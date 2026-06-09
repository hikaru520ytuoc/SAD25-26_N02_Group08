import { ApiProperty } from '@nestjs/swagger';
import { CouncilRole } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class AddCouncilMemberDto {
  @ApiProperty({ example: 'lecturer-uuid' })
  @IsUUID()
  lecturerId!: string;

  @ApiProperty({ enum: CouncilRole })
  @IsEnum(CouncilRole)
  roleInCouncil!: CouncilRole;
}
