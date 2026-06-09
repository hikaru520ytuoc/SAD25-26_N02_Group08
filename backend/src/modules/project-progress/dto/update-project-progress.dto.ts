import { PartialType } from '@nestjs/swagger';
import { CreateProjectProgressDto } from './create-project-progress.dto';

export class UpdateProjectProgressDto extends PartialType(CreateProjectProgressDto) {}
