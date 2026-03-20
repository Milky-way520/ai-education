import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '仅支持 JPEG, PNG, GIF, WebP 格式的图片' },
        { status: 400 }
      );
    }
    
    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过10MB' },
        { status: 400 }
      );
    }
    
    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${randomStr}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // 返回可访问的URL
    const imageUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: file.name,
      size: file.size,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: '上传失败，请稍后重试' },
      { status: 500 }
    );
  }
}
