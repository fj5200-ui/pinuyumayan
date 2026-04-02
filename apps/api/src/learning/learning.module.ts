import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { DatabaseModule } from '../database/database.module';
@Module({ imports: [DatabaseModule], controllers: [LearningController], providers: [LearningService] })
export class LearningModule {}
