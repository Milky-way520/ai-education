import { create } from 'zustand';
import { LearningTask, AIModelConfig, AIModelType, CATEGORIES } from '@/types';

// 应用状态
interface AppState {
  // 当前步骤
  currentStep: 'upload' | 'understanding' | 'video' | 'complete';
  setCurrentStep: (step: 'upload' | 'understanding' | 'video' | 'complete') => void;
  
  // 用户输入
  inputContent: string;
  setInputContent: (content: string) => void;
  
  // 上传的图片
  uploadedImages: string[];
  addUploadedImage: (url: string) => void;
  removeUploadedImage: (index: number) => void;
  clearUploadedImages: () => void;
  
  // 选择的分类
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // 选择的模型
  selectedUnderstandingModel: string;
  setSelectedUnderstandingModel: (modelId: string) => void;
  selectedVideoModel: string;
  setSelectedVideoModel: (modelId: string) => void;
  
  // 生成状态
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  generateProgress: number;
  setGenerateProgress: (progress: number) => void;
  generateStatus: string;
  setGenerateStatus: (status: string) => void;
  
  // 当前任务
  currentTask: LearningTask | null;
  setCurrentTask: (task: LearningTask | null) => void;
  
  // 历史记录
  history: LearningTask[];
  setHistory: (history: LearningTask[]) => void;
  addToHistory: (task: LearningTask) => void;
  
  // AI理解结果
  understandingResult: string;
  setUnderstandingResult: (result: string) => void;
  
  // 视频提示词
  videoPrompt: string;
  setVideoPrompt: (prompt: string) => void;
  
  // 生成的视频URL
  generatedVideoUrl: string;
  setGeneratedVideoUrl: (url: string) => void;
  
  // 设置面板
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  
  // 重置状态
  reset: () => void;
}

// 初始状态
const initialState = {
  currentStep: 'upload' as const,
  inputContent: '',
  uploadedImages: [],
  selectedCategory: CATEGORIES[0].id,
  selectedUnderstandingModel: 'gpt-4o',
  selectedVideoModel: 'kling',
  isGenerating: false,
  generateProgress: 0,
  generateStatus: '',
  currentTask: null,
  history: [],
  understandingResult: '',
  videoPrompt: '',
  generatedVideoUrl: '',
  settingsOpen: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  setInputContent: (content) => set({ inputContent: content }),
  
  addUploadedImage: (url) => set((state) => ({ 
    uploadedImages: [...state.uploadedImages, url] 
  })),
  removeUploadedImage: (index) => set((state) => ({ 
    uploadedImages: state.uploadedImages.filter((_, i) => i !== index) 
  })),
  clearUploadedImages: () => set({ uploadedImages: [] }),
  
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedUnderstandingModel: (modelId) => set({ selectedUnderstandingModel: modelId }),
  setSelectedVideoModel: (modelId) => set({ selectedVideoModel: modelId }),
  
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGenerateProgress: (progress) => set({ generateProgress: progress }),
  setGenerateStatus: (status) => set({ generateStatus: status }),
  
  setCurrentTask: (task) => set({ currentTask: task }),
  
  setHistory: (history) => set({ history }),
  addToHistory: (task) => set((state) => ({ 
    history: [task, ...state.history] 
  })),
  
  setUnderstandingResult: (result) => set({ understandingResult: result }),
  setVideoPrompt: (prompt) => set({ videoPrompt: prompt }),
  setGeneratedVideoUrl: (url) => set({ generatedVideoUrl: url }),
  
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  
  reset: () => set(initialState),
}));

// 模型配置状态
interface ModelConfigState {
  models: AIModelConfig[];
  setModels: (models: AIModelConfig[]) => void;
  updateModel: (id: string, config: Partial<AIModelConfig>) => void;
  getModelsByType: (type: AIModelType) => AIModelConfig[];
}

export const useModelConfigStore = create<ModelConfigState>((set, get) => ({
  models: [],
  setModels: (models) => set({ models }),
  updateModel: (id, config) => set((state) => ({
    models: state.models.map((m) => 
      m.id === id ? { ...m, ...config } : m
    ),
  })),
  getModelsByType: (type) => get().models.filter((m) => m.type === type),
}));
