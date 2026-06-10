import { PartialType } from '@nestjs/swagger';
import { CreateDefenseSessionDto } from './create-defense-session.dto';

export class UpdateDefenseSessionDto extends PartialType(CreateDefenseSessionDto) {}
