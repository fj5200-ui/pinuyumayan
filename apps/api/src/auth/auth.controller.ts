import { Controller, Post, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './auth.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthRateLimitGuard } from '../common/rate-limit.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: '註冊新帳號' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name, dto.tribeId);
  }

  @Post('login')
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: '登入' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新 JWT Token' })
  async refreshToken(@Req() req: any) {
    return this.authService.refreshToken(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取得當前使用者資料' })
  async getProfile(@Req() req: any) {
    const user = await this.authService.getProfile(req.user.id);
    return { user };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新個人資料' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const user = await this.authService.updateProfile(req.user.id, dto);
    return { user };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密碼' })
  async changePassword(@Req() req: any, @Body() body: { oldPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.oldPassword, body.newPassword);
  }

  @Post('forgot-password')
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: '忘記密碼 — 發送重設連結' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.resetPasswordRequest(body.email);
  }

  @Post('reset-password')
  @UseGuards(AuthRateLimitGuard)
  @ApiOperation({ summary: '重設密碼' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
