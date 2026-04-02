import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CulturalSitesService } from './cultural-sites.service';

@ApiTags('Cultural Sites')
@Controller('cultural-sites')
export class CulturalSitesController {
  constructor(private s: CulturalSitesService) {}

  @Get()
  @ApiOperation({ summary: '取得文化景點列表' })
  async getAll(@Query('type') type?: string) { return this.s.getAll(type); }

  @Get('nearby')
  @ApiOperation({ summary: '取得附近文化景點' })
  async getNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    return this.s.getNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius || '10'));
  }

  @Get(':id')
  @ApiOperation({ summary: '取得單一景點' })
  async getById(@Param('id', ParseIntPipe) id: number) { return this.s.getById(id); }
}
