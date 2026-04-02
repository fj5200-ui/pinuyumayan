import { Module } from '@nestjs/common';
import { CulturalSitesController } from './cultural-sites.controller';
import { CulturalSitesService } from './cultural-sites.service';
@Module({ controllers: [CulturalSitesController], providers: [CulturalSitesService] })
export class CulturalSitesModule {}
