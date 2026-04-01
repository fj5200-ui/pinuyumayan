import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../common/jwt-auth.guard';
@ApiTags('Admin') @Controller('admin')
export class AdminController {
  constructor(private s: AdminService) {}

  // ── Public stats (no auth) ──
  @Get('stats') @ApiOperation({ summary: '取得站台統計' })
  async getStats() { return this.s.getStats(); }

  // ── Dashboard (admin only) ──
  @Get('dashboard') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '管理後台 Dashboard' })
  async getDashboard(@Req() req: any) { return this.s.getDashboard(); }

  // ── Users ──
  @Get('users') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '取得用戶列表' })
  async getUsers(@Query('page') p?: string) { return this.s.getUsers(parseInt(p||'1')); }
  @Put('users/:id/role') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '更新用戶角色' })
  async updateRole(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    const result = await this.s.updateRole(id, body.role);
    this.s.logAction(req.user.id, 'UPDATE_ROLE', `user:${id}`, `role→${body.role}`);
    return result;
  }

  // ── Comments ──
  @Get('comments') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '取得所有留言' })
  async getComments(@Query('page') p?: string) { return this.s.getComments(parseInt(p||'1')); }
  @Delete('comments/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除留言' })
  async deleteComment(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_COMMENT', `comment:${id}`);
    return this.s.deleteComment(id);
  }

  // ── Tribes management ──
  @Post('tribes') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增部落' })
  async createTribe(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_TRIBE', body.name);
    return this.s.manageTribe(null, body);
  }
  @Put('tribes/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '編輯部落' })
  async updateTribe(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_TRIBE', `tribe:${id}`);
    return this.s.manageTribe(id, body);
  }
  @Delete('tribes/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除部落' })
  async deleteTribe(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_TRIBE', `tribe:${id}`);
    return this.s.deleteTribe(id);
  }

  // ── Events management ──
  @Post('events') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增活動' })
  async createEvent(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_EVENT', body.title);
    return this.s.manageEvent(null, body);
  }
  @Put('events/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '編輯活動' })
  async updateEvent(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_EVENT', `event:${id}`);
    return this.s.manageEvent(id, body);
  }
  @Delete('events/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除活動' })
  async deleteEvent(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_EVENT', `event:${id}`);
    return this.s.deleteEvent(id);
  }

  // ── Media management ──
  @Post('media') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增媒體' })
  async createMedia(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_MEDIA', body.title);
    return this.s.manageMedia(null, body);
  }
  @Put('media/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '編輯媒體' })
  async updateMedia(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_MEDIA', `media:${id}`);
    return this.s.manageMedia(id, body);
  }
  @Delete('media/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除媒體' })
  async deleteMedia(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_MEDIA', `media:${id}`);
    return this.s.deleteMedia(id);
  }

  // ── Vocabulary management ──
  @Post('vocabulary') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增詞彙' })
  async createVocab(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_VOCAB', body.puyumaWord);
    return this.s.manageVocab(null, body);
  }
  @Put('vocabulary/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '編輯詞彙' })
  async updateVocab(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_VOCAB', `vocab:${id}`);
    return this.s.manageVocab(id, body);
  }
  @Delete('vocabulary/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除詞彙' })
  async deleteVocab(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_VOCAB', `vocab:${id}`);
    return this.s.deleteVocab(id);
  }

  // ── Audit Logs ──
  @Get('audit-logs') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '操作日誌' })
  async getAuditLogs(@Query('page') p?: string) { return this.s.getAuditLogs(parseInt(p||'1')); }
}
