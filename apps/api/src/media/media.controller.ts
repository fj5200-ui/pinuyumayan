import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

const storage = diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

const imageFileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml|avif)$/)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

@ApiTags('Media') @Controller('media')
export class MediaController {
  constructor(private s: MediaService) {}

  @Get() @ApiOperation({ summary: '取得媒體列表' })
  async findAll(@Query('page') p?: string, @Query('limit') l?: string, @Query('type') t?: string) {
    return this.s.findAll(parseInt(p || '1'), parseInt(l || '20'), t);
  }

  @Get(':id') @ApiOperation({ summary: '取得單一媒體' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.s.findOne(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter: imageFileFilter, limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: '上傳圖片檔案' })
  async upload(@UploadedFile() file: any, @Req() r: any) {
    if (!file) throw new Error('No file uploaded');
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const url = `${baseUrl}/api/uploads/${file.filename}`;
    const mediaRecord = await this.s.create({
      title: file.originalname,
      type: 'photo',
      url,
      thumbnailUrl: url,
    }, r.user.id);
    return { url, media: mediaRecord.media };
  }

  @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth() @ApiOperation({ summary: '新增媒體' })
  async create(@Body() b: any, @Req() r: any) {
    return this.s.create(b, r.user.id);
  }

  @Put(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth() @ApiOperation({ summary: '更新媒體' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() b: any) {
    return this.s.update(id, b);
  }

  @Delete(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth() @ApiOperation({ summary: '刪除媒體' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.s.remove(id);
  }
}
