import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UNDERSTANDING_MODELS, VIDEO_MODELS } from '@/types';

// 获取所有模型配置
export async function GET() {
  try {
    const savedModels = await db.aIModel.findMany();
    
    // 合并预设模型和已保存的配置
    const understandingModels = UNDERSTANDING_MODELS.map(preset => {
      const saved = savedModels.find(m => m.id === preset.id && m.type === 'understanding');
      return {
        ...preset,
        apiKey: saved?.apiKey || '',
        baseUrl: saved?.baseUrl || preset.baseUrl,
        isActive: saved?.isActive ?? preset.isActive,
      };
    });
    
    const videoModels = VIDEO_MODELS.map(preset => {
      const saved = savedModels.find(m => m.id === preset.id && m.type === 'video');
      return {
        ...preset,
        apiKey: saved?.apiKey || '',
        baseUrl: saved?.baseUrl || preset.baseUrl,
        isActive: saved?.isActive ?? preset.isActive,
      };
    });
    
    return NextResponse.json({
      success: true,
      understandingModels,
      videoModels,
    });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return NextResponse.json(
      { success: false, error: '获取模型配置失败' },
      { status: 500 }
    );
  }
}

// 更新模型配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, apiKey, baseUrl, isActive } = body;
    
    const existing = await db.aIModel.findUnique({ where: { id } });
    
    if (existing) {
      await db.aIModel.update({
        where: { id },
        data: { apiKey, baseUrl, isActive },
      });
    } else {
      // 找到预设模型信息
      const preset = [...UNDERSTANDING_MODELS, ...VIDEO_MODELS].find(m => m.id === id);
      if (!preset) {
        return NextResponse.json(
          { success: false, error: '模型不存在' },
          { status: 400 }
        );
      }
      
      await db.aIModel.create({
        data: {
          id,
          name: preset.name,
          provider: preset.provider,
          type: preset.type,
          apiKey,
          baseUrl,
          isActive: isActive ?? true,
          description: preset.description,
        },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update model:', error);
    return NextResponse.json(
      { success: false, error: '更新模型配置失败' },
      { status: 500 }
    );
  }
}
