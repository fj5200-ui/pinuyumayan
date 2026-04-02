import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { AdminGuard } from '../common/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('Exports')
@Controller('exports')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(private s: ExportsService) {}

  @Get(':type')
  @ApiOperation({ summary: '匯出 CSV' })
  async exportCsv(@Param('type') type: string, @Res() res: Response) {
    let csv: string;
    switch (type) {
      case 'users': csv = await this.s.exportUsers(); break;
      case 'articles': csv = await this.s.exportArticles(); break;
      case 'vocabulary': csv = await this.s.exportVocabulary(); break;
      case 'events': csv = await this.s.exportEvents(); break;
      case 'tribes': csv = await this.s.exportTribes(); break;
      default: return res.status(400).json({ message: 'Invalid export type' });
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  }
}
