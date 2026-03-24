import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// 敏感词列表（应该从配置文件或数据库中加载，并支持动态更新）
const SENSITIVE_WORDS = new Set([
  '暴力', '色情', '赌博', '毒品', '恐怖主义',
  '自杀', '自残', '违禁品', '邪教'
]);

// 内容审核函数 - 确保内容合规
async function auditContent(content: string): Promise<{ isSafe: boolean; reason?: string }> {
  const lowerContent = content.toLowerCase();
  
  // 首先进行本地敏感词检查（快速失败）
  for (const word of SENSITIVE_WORDS) {
    if (lowerContent.includes(word.toLowerCase())) {
      return { isSafe: false, reason: `内容包含敏感词汇` };
    }
  }
  
  // 内容长度限制（防止过长内容消耗过多资源）
  const maxContentLength = 10000;
  if (content.length > maxContentLength) {
    return { isSafe: false, reason: '内容长度超过限制' };
  }
  
  // 使用 AI 进行内容审核（带超时控制）
  try {
    const zai = await ZAI.create();
    const auditResult = await Promise.race([
      zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `你是一个内容审核专家。请判断以下内容是否适合用于教育目的。
内容应该：
1. 不包含任何违法、有害、暴力、色情内容
2. 不涉及政治敏感话题
3. 符合教育伦理道德标准
4. 适合学生学习和理解

请只回答"SAFE"或"UNSAFE"，如果是 UNSAFE，请在一行后说明原因。`
          },
          {
            role: 'user',
            content: content.substring(0, maxContentLength)
          }
        ],
        maxTokens: 100,
      }),
      // 10 秒超时
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('审核超时')), 10000)
      )
    ]);
    
    const result = auditResult.choices[0]?.message?.content || '';
    if (result.startsWith('UNSAFE')) {
      return { 
        isSafe: false, 
        reason: result.replace('UNSAFE', '').trim() || '内容不符合教育伦理标准'
      };
    }
  } catch (error) {
    console.error('AI audit failed:', error);
    // AI 审核失败时，可以选择拒绝或继续处理
    // 这里选择继续处理但记录警告
  }
  
  return { isSafe: true };
}

// 生成理解的函数（带并发优化）
async function generateUnderstanding(
  content: string, 
  imageUrls: string[] = [],
  category: string = 'other'
): Promise<{ understanding: string; videoPrompt: string }> {
  const zai = await ZAI.create();
  
  const categoryContext: Record<string, string> = {
    math: '数学学科',
    physics: '物理学科',
    chemistry: '化学学科',
    biology: '生物学科',
    history: '历史学科',
    literature: '语文/文学学科',
    english: '英语学科',
    programming: '编程/计算机科学',
    other: '通用学科',
  };
  
  const systemPrompt = `你是一位资深的教育专家，擅长深入浅出地讲解各种知识。
你的任务是：
1. 仔细理解用户上传的问题或知识点
2. 用清晰、易懂的方式进行解释
3. 提供必要的背景知识和相关概念
4. 如果是题目，提供详细的解题步骤
5. 总结关键要点

学科背景：${categoryContext[category] || '通用学科'}

请确保你的解释：
- 准确无误
- 逻辑清晰
- 循序渐进
- 易于理解`;

  // 限制图片数量，防止资源滥用
  const limitedImageUrls = imageUrls.slice(0, 5);
  
  const userContent = limitedImageUrls.length > 0 
    ? [
        { type: 'text', text: `请帮我理解和解释以下内容：\n\n${content}` },
        ...limitedImageUrls.map(url => ({ 
          type: 'image_url', 
          image_url: { url } 
        }))
      ]
    : `请帮我理解和解释以下内容：\n\n${content}`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: userContent as any
      }
    ],
    maxTokens: 4000,
  });
  
  const understanding = completion.choices[0]?.message?.content || '';
  
  // 并行生成视频提示词（如果 understanding 不为空）
  let videoPrompt = '';
  if (understanding) {
    const promptSystem = `你是一个视频脚本编写专家。根据教育内容生成适合 AI 视频生成的提示词。
要求：
1. 提示词应该描述一个教学视频场景
2. 包含关键视觉元素描述
3. 语言简洁明了
4. 适合${categoryContext[category]}教学场景`;

    try {
      const promptCompletion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: promptSystem },
          { 
            role: 'user', 
            content: `请根据以下教学内容生成一个适合 AI 视频生成的提示词（不超过 200 字）：\n\n${understanding.substring(0, 1000)}`
          }
        ],
        maxTokens: 500,
      });
      
      videoPrompt = promptCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Failed to generate video prompt:', error);
      // 视频提示词生成失败不影响主流程
    }
  }
  
  return { understanding, videoPrompt };
}

// 生成视频的函数（带重试机制）
async function generateVideo(videoPrompt: string, maxRetries = 2): Promise<string> {
  const zai = await ZAI.create();
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await zai.images.generations.create({
        prompt: `Educational video scene: ${videoPrompt}. Professional teaching animation, clean whiteboard style, educational content visualization.`,
        size: '1024x1024',
      });
      
      return response.data[0]?.base64 || '';
    } catch (error) {
      console.error(`Video generation failed (attempt ${attempt + 1}):`, error);
      if (attempt === maxRetries) {
        throw new Error('视频生成失败，请稍后重试');
      }
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error('视频生成失败');
}

// 主处理函数
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 添加请求体大小限制
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '请求体过大' },
        { status: 413 }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '无效的请求格式' },
        { status: 400 }
      );
    }
    
    const { 
      content, 
      imageUrls = [], 
      category = 'other',
      generateVideo: shouldGenerateVideo = true 
    } = body;
    
    // 参数验证
    if (!content && imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供问题内容或上传图片' },
        { status: 400 }
      );
    }
    
    // 内容长度验证
    if (content && content.length > 10000) {
      return NextResponse.json(
        { success: false, error: '内容长度不能超过 10000 字符' },
        { status: 400 }
      );
    }
    
    // 图片数量限制
    if (imageUrls.length > 10) {
      return NextResponse.json(
        { success: false, error: '最多只能上传 10 张图片' },
        { status: 400 }
      );
    }
    
    // 创建任务记录
    const task = await db.learningTask.create({
      data: {
        title: content ? content.substring(0, 50) + (content.length > 50 ? '...' : '') : '图片问题',
        content: content || '',
        imageUrls: JSON.stringify(imageUrls),
        category,
        status: 'processing',
      },
    });
    
    // 内容审核
    const audit = await auditContent(content || '');
    if (!audit.isSafe) {
      await db.learningTask.update({
        where: { id: task.id },
        data: { 
          status: 'failed',
          understanding: `内容审核未通过：${audit.reason}`
        },
      });
      return NextResponse.json(
        { success: false, error: audit.reason },
        { status: 400 }
      );
    }
    
    // 生成理解
    const { understanding, videoPrompt } = await generateUnderstanding(
      content, 
      imageUrls, 
      category
    );
    
    // 更新任务
    await db.learningTask.update({
      where: { id: task.id },
      data: {
        understanding,
        videoPrompt,
        status: 'completed',
      },
    });
    
    // 如果需要生成视频
    let videoUrl = '';
    if (shouldGenerateVideo && videoPrompt) {
      try {
        videoUrl = await generateVideo(videoPrompt);
        await db.learningTask.update({
          where: { id: task.id },
          data: {
            videoUrl,
            videoStatus: 'completed',
          },
        });
      } catch (error) {
        console.error('Video generation error:', error);
        await db.learningTask.update({
          where: { id: task.id },
          data: {
            videoStatus: 'failed',
          },
        });
        // 视频生成失败不影响返回结果
      }
    }
    
    // 记录生成历史
    try {
      await db.generationHistory.create({
        data: {
          taskId: task.id,
          modelUsed: 'z-ai',
          inputType: imageUrls.length > 0 ? 'image' : 'text',
          outputType: 'understanding',
          status: 'success',
          duration: Date.now() - startTime,
        },
      });
    } catch (error) {
      console.error('Failed to record history:', error);
    }
    
    return NextResponse.json({
      success: true,
      taskId: task.id,
      understanding,
      videoPrompt,
      videoUrl,
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    
    // 记录失败历史
    try {
      await db.generationHistory.create({
        data: {
          taskId: 'unknown',
          modelUsed: 'z-ai',
          inputType: 'unknown',
          outputType: 'understanding',
          status: 'failed',
          duration: Date.now() - startTime,
        },
      });
    } catch (historyError) {
      console.error('Failed to record failure:', historyError);
    }
    
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取任务列表（带分页）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    
    const [tasks, total] = await Promise.all([
      db.learningTask.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.learningTask.count(),
    ]);
    
    return NextResponse.json({
      success: true,
      tasks: tasks.map(t => ({
        ...t,
        imageUrls: t.imageUrls ? JSON.parse(t.imageUrls) : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { success: false, error: '获取任务列表失败' },
      { status: 500 }
    );
  }
}
