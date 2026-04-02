import { Module } from '@nestjs/common';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';
import { DatabaseModule } from '../database/database.module';
@Module({ imports: [DatabaseModule], controllers: [ApprovalController], providers: [ApprovalService] })
export class ApprovalModule {}
