import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Learning')
@Controller('learning')
export class LearningController {
  constructor(private s: LearningService) {}

  @Get('progress')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '取得學習進度' })
  async getProgress(@Req() req: any) { return this.s.getProgress(req.user.id); }

  @Post('quiz-result')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '記錄測驗結果' })
  async recordQuiz(@Req() req: any, @Body() body: { wordId: number; correct: boolean }) {
    return this.s.recordQuiz(req.user.id, body.wordId, body.correct);
  }

  @Post('mark-learned')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '標記學會詞彙' })
  async markLearned(@Req() req: any, @Body() body: { wordIds: number[] }) {
    return this.s.markLearned(req.user.id, body.wordIds);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: '學習排行榜' })
  async getLeaderboard() { return this.s.getLeaderboard(); }
}
