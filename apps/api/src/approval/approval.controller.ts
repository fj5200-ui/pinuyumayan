import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { AdminGuard } from '../common/jwt-auth.guard';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Approval')
@Controller('approval')
export class ApprovalController {
  constructor(private s: ApprovalService) {}

  @Get('queue')
  @UseGuards(AdminGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '審核隊列' })
  async getQueue(@Query('status') status?: string, @Query('type') type?: string, @Query('page') page?: string) {
    return this.s.getQueue(status, type, parseInt(page || '1'));
  }

  @Post(':id/approve')
  @UseGuards(AdminGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '核准' })
  async approve(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() body: { note?: string }) {
    return this.s.approve(id, req.user.name || 'Admin', body.note);
  }

  @Post(':id/reject')
  @UseGuards(AdminGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '退回' })
  async reject(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() body: { note?: string }) {
    return this.s.reject(id, req.user.name || 'Admin', body.note);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '送出審核' })
  async submit(@Req() req: any, @Body() body: { type: string; title: string; content: string }) {
    return this.s.submit(body.type, body.title, body.content, req.user.id, req.user.name || `User#${req.user.id}`);
  }
}
