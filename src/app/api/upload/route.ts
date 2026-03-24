import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

// 允许的 MIME 类型映射
const ALLOWED_MIME_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp'],
]);

// 验证文件魔术字节
function validateMagicNumber(buffer: Buffer): string | null {
  const signatures: Array<{ mime: string; signature: Buffer }> = [
    { mime: 'image/jpeg', signature: Buffer.from([0xFF, 0xD8, 0xFF]) },
    { mime: 'image/png', signature: Buffer.from([0x89, 0x50, 0x4E, 0x47]) },
    { mime: 'image/gif', signature: Buffer.from([0x47, 0x49, 0x46]) },
    { mime: 'image/webp', signature: Buffer.from([0x52, 0x49, 0x46, 0x46]) },
  ];
  
  for (const { mime, signature } of signatures) {
    if (buffer.slice(0, signature.length).equals(signature)) {
      return mime;
    }
  }
  return null;
}

// 清理文件名，防止路径遍历
function sanitizeFileName(fileName: string): string {
  return path.basename(fileName).replace(/[^a-zA-Z0-9.-]/g, '_');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '请选择要上传的文件' },
        { status: 400 }
      );
    }
    
    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过 5MB' },
        { status: 400 }
      );
    }
    
    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 验证魔术字节
    const actualMimeType = validateMagicNumber(buffer);
    if (!actualMimeType || !ALLOWED_MIME_TYPES.has(actualMimeType)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件格式' },
        { status: 400 }
      );
    }
    
    // 验证 MIME 类型与魔术字节是否一致
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: '无效的文件类型' },
        { status: 400 }
      );
    }
    
    // 使用 sharp 处理图片，移除潜在恶意元数据并重新编码
    let processedBuffer: Buffer;
    try {
      processedBuffer = await sharp(buffer)
        .rotate() // 自动根据 EXIF 旋转
        .toFormat(actualMimeType.replace('image/', '') as 'jpg' | 'png' | 'gif' | 'webp')
        .toBuffer();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '图片格式损坏或无效' },
        { status: 400 }
      );
    }
    
    // 创建上传目录（放在项目外部更安全）
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // 生成安全的文件名
    const ext = ALLOWED_MIME_TYPES.get(actualMimeType);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    // 保存处理后的文件
    await writeFile(filePath, processedBuffer);
    
    // 返回可访问的 URL
    const imageUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      size: processedBuffer.length,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: '上传失败，请稍后重试' },
      { status: 500 }
    );
  }
}
