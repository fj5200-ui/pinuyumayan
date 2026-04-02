import { Module } from '@nestjs/common';
import { CulturalSitesController } from './cultural-sites.controller';
import { CulturalSitesService } from './cultural-sites.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CulturalSitesController],
  providers: [CulturalSitesService],
})
export class CulturalSitesModule {}
