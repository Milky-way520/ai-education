import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// 内容审核函数 - 确保内容合规
async function auditContent(content: string): Promise<{ isSafe: boolean; reason?: string }> {
  // 敏感词列表（简化版，实际应用中应该更完善）
  const sensitiveWords = [
    '暴力', '色情', '赌博', '毒品', '恐怖主义',
    '自杀', '自残', '违禁品', '邪教'
  ];
  
  const lowerContent = content.toLowerCase();
  
  for (const word of sensitiveWords) {
    if (lowerContent.includes(word)) {
      return { isSafe: false, reason: `内容包含敏感词汇：${word}` };
    }
  }
  
  // 使用AI进行内容审核
  try {
    const zai = await ZAI.create();
    const auditResult = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `你是一个内容审核专家。请判断以下内容是否适合用于教育目的。
内容应该：
1. 不包含任何违法、有害、暴力、色情内容
2. 不涉及政治敏感话题
3. 符合教育伦理道德标准
4. 适合学生学习和理解

请只回答"SAFE"或"UNSAFE"，如果是UNSAFE，请在一行后说明原因。`
        },
        {
          role: 'user',
          content: content
        }
      ],
      maxTokens: 100,
    });
    
    const result = auditResult.choices[0]?.message?.content || '';
    if (result.startsWith('UNSAFE')) {
      return { 
        isSafe: false, 
        reason: result.replace('UNSAFE', '').trim() || '内容不符合教育伦理标准'
      };
    }
  } catch (error) {
    console.error('AI audit failed:', error);
    // 如果AI审核失败，继续处理但记录警告
  }
  
  return { isSafe: true };
}

// 生成理解的函数
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

  const userContent = imageUrls.length > 0 
    ? [
        { type: 'text', text: `请帮我理解和解释以下内容：\n\n${content}` },
        ...imageUrls.map(url => ({ 
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
  
  // 生成视频提示词
  const promptSystem = `你是一个视频脚本编写专家。根据教育内容生成适合AI视频生成的提示词。
要求：
1. 提示词应该描述一个教学视频场景
2. 包含关键视觉元素描述
3. 语言简洁明了
4. 适合${categoryContext[category]}教学场景`;

  const promptCompletion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: promptSystem },
      { 
        role: 'user', 
        content: `请根据以下教学内容生成一个适合AI视频生成的提示词（不超过200字）：\n\n${understanding.substring(0, 1000)}`
      }
    ],
    maxTokens: 500,
  });
  
  const videoPrompt = promptCompletion.choices[0]?.message?.content || '';
  
  return { understanding, videoPrompt };
}

// 生成视频的函数
async function generateVideo(videoPrompt: string): Promise<string> {
  const zai = await ZAI.create();
  
  try {
    const response = await zai.images.generations.create({
      prompt: `Educational video scene: ${videoPrompt}. Professional teaching animation, clean whiteboard style, educational content visualization.`,
      size: '1024x1024',
    });
    
    // 注意：这里使用图片生成API作为演示
    // 实际项目中应该使用视频生成API
    return response.data[0]?.base64 || '';
  } catch (error) {
    console.error('Video generation failed:', error);
    throw new Error('视频生成失败，请稍后重试');
  }
}

// 主处理函数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      content, 
      imageUrls = [], 
      category = 'other',
      generateVideo: shouldGenerateVideo = true 
    } = body;
    
    if (!content && imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供问题内容或上传图片' },
        { status: 400 }
      );
    }
    
    // 创建任务记录
    const task = await db.learningTask.create({
      data: {
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        content,
        imageUrls: JSON.stringify(imageUrls),
        category,
        status: 'processing',
      },
    });
    
    // 内容审核
    const audit = await auditContent(content);
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
    if (shouldGenerateVideo) {
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
      }
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
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取任务列表
export async function GET() {
  try {
    const tasks = await db.learningTask.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    
    return NextResponse.json({
      success: true,
      tasks: tasks.map(t => ({
        ...t,
        imageUrls: t.imageUrls ? JSON.parse(t.imageUrls) : [],
      })),
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { success: false, error: '获取任务列表失败' },
      { status: 500 }
    );
  }
}
