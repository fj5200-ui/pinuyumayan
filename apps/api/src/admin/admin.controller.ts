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

  // ── Audit Logs (upgraded) ──
  @Get('audit-logs') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '操作日誌' })
  async getAuditLogs(@Query('page') p?: string, @Query('action') action?: string, @Query('userId') uid?: string) {
    return this.s.getAuditLogs(parseInt(p||'1'), 50, action || undefined, uid ? parseInt(uid) : undefined);
  }

  // ── Feature Flags (DB-persisted) ──
  @Get('feature-flags') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: 'Feature Flags 列表' })
  async getFeatureFlags() { return this.s.getFeatureFlags(); }
  @Post('feature-flags') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增 Feature Flag' })
  async createFeatureFlag(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_FLAG', body.key);
    return this.s.createFeatureFlag(body);
  }
  @Put('feature-flags/:id/toggle') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '切換 Feature Flag' })
  async toggleFeatureFlag(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'TOGGLE_FLAG', `flag:${id}`);
    return this.s.toggleFeatureFlag(id);
  }
  @Delete('feature-flags/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除 Feature Flag' })
  async deleteFeatureFlag(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_FLAG', `flag:${id}`);
    return this.s.deleteFeatureFlag(id);
  }

  // ── Triggers ──
  @Get('triggers') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: 'Trigger 列表' })
  async getTriggers() { return this.s.getTriggers(); }
  @Post('triggers') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增 Trigger' })
  async createTrigger(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_TRIGGER', body.name);
    return this.s.createTrigger(body, req.user.id);
  }
  @Put('triggers/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '更新 Trigger' })
  async updateTrigger(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_TRIGGER', `trigger:${id}`);
    return this.s.updateTrigger(id, body);
  }
  @Delete('triggers/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除 Trigger' })
  async deleteTrigger(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_TRIGGER', `trigger:${id}`);
    return this.s.deleteTrigger(id);
  }

  // ── AI Agents ──
  @Get('agents') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: 'AI Agent 列表' })
  async getAgents() { return this.s.getAgents(); }
  @Get('agents/:id/logs') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: 'Agent 執行記錄' })
  async getAgentLogs(@Param('id', ParseIntPipe) id: number, @Query('page') p?: string) { return this.s.getAgentLogs(id, parseInt(p||'1')); }
  @Post('agents') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增 Agent' })
  async createAgent(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_AGENT', body.name);
    return this.s.createAgent(body, req.user.id);
  }
  @Put('agents/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '更新 Agent' })
  async updateAgent(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_AGENT', `agent:${id}`);
    return this.s.updateAgent(id, body);
  }
  @Delete('agents/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除 Agent' })
  async deleteAgent(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_AGENT', `agent:${id}`);
    return this.s.deleteAgent(id);
  }

  // ── Revenue ──
  @Get('revenue') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '營收記錄' })
  async getRevenue(@Query('page') p?: string) { return this.s.getRevenue(parseInt(p||'1')); }
  @Post('revenue') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增營收記錄' })
  async createRevenue(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_REVENUE', body.description || 'revenue');
    return this.s.createRevenue(body, req.user.id);
  }
  @Delete('revenue/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除營收記錄' })
  async deleteRevenue(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_REVENUE', `revenue:${id}`);
    return this.s.deleteRevenue(id);
  }

  // ── Map Markers ──
  @Get('map-markers') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '地圖標記列表' })
  async getMapMarkers() { return this.s.getMapMarkers(); }
  @Post('map-markers') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增地圖標記' })
  async createMapMarker(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_MARKER', body.name);
    return this.s.createMapMarker(body, req.user.id);
  }
  @Put('map-markers/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '更新地圖標記' })
  async updateMapMarker(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_MARKER', `marker:${id}`);
    return this.s.updateMapMarker(id, body);
  }
  @Delete('map-markers/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除地圖標記' })
  async deleteMapMarker(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_MARKER', `marker:${id}`);
    return this.s.deleteMapMarker(id);
  }

  // ── Login History ──
  @Get('login-history') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '登入歷史' })
  async getLoginHistory(@Query('page') p?: string, @Query('userId') uid?: string) {
    return this.s.getLoginHistory(parseInt(p||'1'), uid ? parseInt(uid) : undefined);
  }

  // ── Discussions management ──
  @Get('discussions') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '討論列表(管理)' })
  async getDiscussionsAdmin(@Query('page') p?: string) { return this.s.getDiscussionsAdmin(parseInt(p||'1')); }
  @Delete('discussions/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除討論' })
  async deleteDiscussion(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_DISCUSSION', `discussion:${id}`);
    return this.s.deleteDiscussion(id);
  }

  // ── Cultural Sites management ──
  @Get('cultural-sites') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '文化景點列表(管理)' })
  async getCulturalSitesAdmin() { return this.s.getCulturalSitesAdmin(); }
  @Post('cultural-sites') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增文化景點' })
  async createCulturalSite(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'CREATE_SITE', body.name);
    return this.s.createCulturalSite(body);
  }
  @Put('cultural-sites/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '更新文化景點' })
  async updateCulturalSite(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_SITE', `site:${id}`);
    return this.s.updateCulturalSite(id, body);
  }
  @Delete('cultural-sites/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除文化景點' })
  async deleteCulturalSite(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.s.logAction(req.user.id, 'DELETE_SITE', `site:${id}`);
    return this.s.deleteCulturalSite(id);
  }

  // ── Site Settings (hero, header, footer customization) ── MUST be before users/:id
  @Get('site-settings') @ApiOperation({ summary: '取得網站設定 (公開)' })
  async getSiteSettings() { return this.s.getSiteSettings(); }

  @Put('site-settings') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '更新網站設定' })
  async updateSiteSettings(@Body() body: any, @Req() req: any) {
    this.s.logAction(req.user.id, 'UPDATE_SITE_SETTINGS', JSON.stringify(Object.keys(body)).slice(0, 100));
    return this.s.updateSiteSettings(body);
  }

  // ── System Monitoring (real metrics) ──
  @Get('system-metrics') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '系統指標' })
  async getSystemMetrics() { return this.s.getSystemMetrics(); }

  // ── User Detail (MUST be last — :id is a catch-all param) ──
  @Get('users/:id') @UseGuards(AdminGuard) @ApiBearerAuth() @ApiOperation({ summary: '用戶詳情' })
  async getUserDetail(@Param('id', ParseIntPipe) id: number) { return this.s.getUserDetail(id); }
}
