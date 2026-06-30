import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LookupsController } from './lookups.controller';
import { LookupsService } from './lookups.service';

@Module({
  imports: [JwtModule],
  controllers: [LookupsController],
  providers: [LookupsService],
})
export class LookupsModule {}
