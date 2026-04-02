import { Controller, Get, Post, Param, ParseIntPipe, UseGuards, Req, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get('articles/:articleId/versions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取得文章版本歷史' })
  async getVersions(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.workflowsService.getVersions(articleId);
  }

  @Get('versions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取得特定版本內容' })
  async getVersion(@Param('id', ParseIntPipe) id: number) {
    return this.workflowsService.getVersion(id);
  }

  @Post('versions/:id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '還原文章至指定版本' })
  async restoreVersion(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.workflowsService.restoreVersion(id, req.user.id, req.user.name || `User#${req.user.id}`);
  }
}
