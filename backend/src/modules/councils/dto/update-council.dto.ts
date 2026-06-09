import { PartialType } from '@nestjs/swagger';
import { CreateCouncilDto } from './create-council.dto';

export class UpdateCouncilDto extends PartialType(CreateCouncilDto) {}
