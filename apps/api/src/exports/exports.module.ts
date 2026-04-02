import { Module } from '@nestjs/common';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { DatabaseModule } from '../database/database.module';
@Module({ imports: [DatabaseModule], controllers: [ExportsController], providers: [ExportsService] })
export class ExportsModule {}
