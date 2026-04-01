import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DiscussionsService } from './discussions.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Discussions')
@Controller('discussions')
export class DiscussionsController {
  constructor(private s: DiscussionsService) {}

  @Get()
  @ApiOperation({ summary: '取得討論列表' })
  async findAll(@Query('board') board?: string, @Query('page') page?: string) {
    return this.s.findAll(board, parseInt(page || '1'));
  }

  @Get(':id')
  @ApiOperation({ summary: '取得單則討論與回覆' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.s.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '發布新討論' })
  async create(@Body() body: { board: string; title: string; content: string }, @Req() req: any) {
    return this.s.create(body, req.user.id);
  }

  @Post(':id/replies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '回覆討論' })
  async reply(@Param('id', ParseIntPipe) id: number, @Body() body: { content: string }, @Req() req: any) {
    return this.s.reply(id, body.content, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '按讚/取消讚' })
  async toggleLike(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.s.toggleLike(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刪除討論' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.s.remove(id, req.user.id, req.user.role);
  }
}
