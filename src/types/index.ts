// AI模型类型
export type AIModelType = 'understanding' | 'video';

// AI提供商
export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'deepseek' 
  | 'alibaba' 
  | 'zhipu'
  | 'kling'
  | 'runway'
  | 'pika';

// AI模型配置
export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  type: AIModelType;
  apiKey?: string;
  baseUrl?: string;
  isActive: boolean;
  description?: string;
}

// 学习任务状态
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 学习任务
export interface LearningTask {
  id: string;
  title: string;
  content: string;
  imageUrls?: string[];
  category?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  understanding?: string;
  videoPrompt?: string;
  videoUrl?: string;
  videoStatus?: string;
}

// 生成请求
export interface GenerateRequest {
  content: string;
  imageUrls?: string[];
  understandingModelId: string;
  videoModelId?: string;
  category?: string;
}

// 生成响应
export interface GenerateResponse {
  success: boolean;
  taskId?: string;
  understanding?: string;
  videoPrompt?: string;
  videoUrl?: string;
  error?: string;
}

// 预设的理解型AI模型
export const UNDERSTANDING_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai' as AIProvider,
    type: 'understanding' as AIModelType,
    description: 'OpenAI最强多模态模型，支持图片理解',
    isActive: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai' as AIProvider,
    type: 'understanding' as AIModelType,
    description: '轻量版GPT-4o，性价比高',
    isActive: true,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic' as AIProvider,
    type: 'understanding' as AIModelType,
    description: 'Anthropic最新模型，逻辑推理强',
    isActive: true,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google' as AIProvider,
    type: 'understanding' as AIModelType,
    description: 'Google多模态模型，免费额度多',
    isActive: true,
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek' as AIProvider,
    type: 'understanding' as AIModelType,
    description: '国产模型，性价比极高',
    isActive: true,
  },
  {
    id: 'qwen-max',
    name: '通义千问 Max',
    provider: 'alibaba' as AIProvider,
    type: 'understanding' as AIModelType,
    description: '阿里云大模型，中文理解优秀',
    isActive: true,
  },
  {
    id: 'glm-4v',
    name: 'GLM-4V',
    provider: 'zhipu' as AIProvider,
    type: 'understanding' as AIModelType,
    description: '智谱多模态模型，国内访问友好',
    isActive: true,
  },
];

// 预设的视频生成AI模型
export const VIDEO_MODELS = [
  {
    id: 'kling',
    name: '可灵 AI (Kling)',
    provider: 'kling' as AIProvider,
    type: 'video' as AIModelType,
    description: '快手旗下，国内领先的视频生成AI',
    isActive: true,
  },
  {
    id: 'runway-gen3',
    name: 'Runway Gen-3',
    provider: 'runway' as AIProvider,
    type: 'video' as AIModelType,
    description: '国际顶尖视频生成模型',
    isActive: true,
  },
  {
    id: 'pika',
    name: 'Pika Labs',
    provider: 'pika' as AIProvider,
    type: 'video' as AIModelType,
    description: '创意视频生成，效果惊艳',
    isActive: true,
  },
];

// 内容分类
export const CATEGORIES = [
  { id: 'math', name: '数学', icon: '📐' },
  { id: 'physics', name: '物理', icon: '⚛️' },
  { id: 'chemistry', name: '化学', icon: '🧪' },
  { id: 'biology', name: '生物', icon: '🧬' },
  { id: 'history', name: '历史', icon: '📜' },
  { id: 'literature', name: '语文/文学', icon: '📚' },
  { id: 'english', name: '英语', icon: '🌍' },
  { id: 'programming', name: '编程', icon: '💻' },
  { id: 'other', name: '其他', icon: '📖' },
];
