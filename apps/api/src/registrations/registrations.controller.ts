import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private s: RegistrationsService) {}

  @Post('events/:eventId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '報名活動' })
  async register(@Param('eventId', ParseIntPipe) eventId: number, @Req() req: any, @Body() body: { note?: string }) {
    return this.s.register(eventId, req.user.id, req.user.name || `User#${req.user.id}`, body.note);
  }

  @Delete('events/:eventId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '取消報名' })
  async cancel(@Param('eventId', ParseIntPipe) eventId: number, @Req() req: any) {
    return this.s.cancel(eventId, req.user.id);
  }

  @Get('events/:eventId')
  @ApiOperation({ summary: '查看活動報名列表' })
  async getByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.s.getByEvent(eventId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '我的報名' })
  async getMyRegistrations(@Req() req: any) { return this.s.getByUser(req.user.id); }

  @Get('check/:eventId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '檢查是否已報名' })
  async check(@Param('eventId', ParseIntPipe) eventId: number, @Req() req: any) {
    return this.s.checkRegistration(eventId, req.user.id);
  }
}
