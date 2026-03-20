'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Video, 
  Settings, 
  Download,
  Sparkles,
  BookOpen,
  ChevronRight,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
  Trash2,
  Copy,
  RefreshCw,
  History,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  UNDERSTANDING_MODELS, 
  VIDEO_MODELS, 
  CATEGORIES, 
  CATEGORY 
} from '@/types';

// 步骤配置
const STEPS = [
  { id: 'upload', label: '上传内容', icon: Upload },
  { id: 'understanding', label: 'AI理解', icon: BookOpen },
  { id: 'video', label: '生成视频', icon: Video },
  { id: 'complete', label: '完成', icon: Check },
];

// 分类选择器组件
function CategorySelector({ 
  selected, 
  onSelect 
}: { 
  selected: string; 
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`p-3 rounded-lg border-2 transition-all ${
            selected === cat.id
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-2xl block mb-1">{cat.icon}</span>
          <span className="text-xs font-medium">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

// 图片上传组件
function ImageUploader({
  images,
  onAdd,
  onRemove
}: {
  images: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        onAdd(data.url);
        toast.success('图片上传成功');
      } else {
        toast.error(data.error || '上传失败');
      }
    } catch (error) {
      toast.error('上传失败，请重试');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      
      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`上传图片 ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg border"
            />
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs mt-1">添加</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// 模型选择器组件
function ModelSelector({
  models,
  selected,
  onSelect,
  type
}: {
  models: typeof UNDERSTANDING_MODELS | typeof VIDEO_MODELS;
  selected: string;
  onSelect: (id: string) => void;
  type: 'understanding' | 'video';
}) {
  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="选择模型" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center gap-2">
              <span>{model.name}</span>
              {model.isActive && (
                <Badge variant="secondary" className="text-xs">推荐</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// 结果展示组件
function ResultDisplay({
  understanding,
  videoPrompt,
  videoUrl,
  onRegenerate
}: {
  understanding: string;
  videoPrompt: string;
  videoUrl: string;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(understanding);
    setCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${videoUrl}`;
      link.download = `ai-education-${Date.now()}.png`;
      link.click();
      toast.success('下载成功');
    }
  };

  return (
    <div className="space-y-6">
      {/* AI理解结果 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              AI 解读结果
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full rounded-md border p-4 bg-muted/30">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {understanding || '等待生成...'}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 视频提示词 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            视频生成提示词
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-md bg-muted/30 text-sm">
            {videoPrompt || '等待生成...'}
          </div>
        </CardContent>
      </Card>

      {/* 生成的视频/图片 */}
      {videoUrl && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                生成的教学资源
              </CardTitle>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                下载资源
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${videoUrl}`}
                alt="生成的教学资源"
                className="max-w-full rounded-lg shadow-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 设置对话框组件
function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            模型设置
          </DialogTitle>
          <DialogDescription>
            配置各个AI模型的API密钥和相关参数
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="understanding" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="understanding">理解型 AI (1.AI)</TabsTrigger>
            <TabsTrigger value="video">视频生成 AI (2.AI)</TabsTrigger>
          </TabsList>

          <TabsContent value="understanding" className="space-y-4 mt-4">
            {UNDERSTANDING_MODELS.map((model) => (
              <Card key={model.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{model.name}</CardTitle>
                      <CardDescription>{model.description}</CardDescription>
                    </div>
                    <Badge>{model.provider.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={`key-${model.id}`}>API Key</Label>
                    <Input
                      id={`key-${model.id}`}
                      type="password"
                      placeholder="输入API密钥..."
                      value={apiKeys[model.id] || ''}
                      onChange={(e) => setApiKeys(prev => ({
                        ...prev,
                        [model.id]: e.target.value
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            {VIDEO_MODELS.map((model) => (
              <Card key={model.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{model.name}</CardTitle>
                      <CardDescription>{model.description}</CardDescription>
                    </div>
                    <Badge>{model.provider.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={`key-${model.id}`}>API Key</Label>
                    <Input
                      id={`key-${model.id}`}
                      type="password"
                      placeholder="输入API密钥..."
                      value={apiKeys[model.id] || ''}
                      onChange={(e) => setApiKeys(prev => ({
                        ...prev,
                        [model.id]: e.target.value
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={() => {
            toast.success('设置已保存');
            onOpenChange(false);
          }}>
            保存设置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 历史记录组件
function HistoryPanel({
  onSelect
}: {
  onSelect: (task: any) => void
}) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/generate');
      const data = await res.json();
      if (data.success) {
        setHistory(data.tasks);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useState(() => {
    loadHistory();
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5" />
          历史记录
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              暂无历史记录
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onSelect(task)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium truncate">{task.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(task.createdAt).toLocaleString('zh-CN')}
                  </div>
                  <Badge 
                    variant={task.status === 'completed' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {task.status === 'completed' ? '已完成' : task.status}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// 主页面组件
export default function HomePage() {
  // 状态
  const [currentStep, setCurrentStep] = useState(0);
  const [inputContent, setInputContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [selectedUnderstandingModel, setSelectedUnderstandingModel] = useState('gpt-4o');
  const [selectedVideoModel, setSelectedVideoModel] = useState('kling');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 结果状态
  const [understanding, setUnderstanding] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // 添加图片
  const addImage = (url: string) => {
    setUploadedImages(prev => [...prev, url]);
  };

  // 移除图片
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 开始生成
  const handleGenerate = async () => {
    if (!inputContent.trim() && uploadedImages.length === 0) {
      toast.error('请输入问题内容或上传图片');
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setStatusText('正在进行内容审核...');
    setCurrentStep(1);

    try {
      setProgress(20);
      setStatusText('AI正在理解问题...');

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputContent,
          imageUrls: uploadedImages,
          category: selectedCategory,
          generateVideo: true,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || '生成失败');
      }

      setProgress(80);
      setStatusText('生成完成！');

      setUnderstanding(data.understanding);
      setVideoPrompt(data.videoPrompt);
      setVideoUrl(data.videoUrl);

      setProgress(100);
      setCurrentStep(3);
      toast.success('生成成功！');

    } catch (error: any) {
      toast.error(error.message || '生成失败，请重试');
      setCurrentStep(0);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setStatusText('');
    }
  };

  // 重新开始
  const handleReset = () => {
    setCurrentStep(0);
    setInputContent('');
    setUploadedImages([]);
    setUnderstanding('');
    setVideoPrompt('');
    setVideoUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">爱的教育</h1>
              <p className="text-xs text-muted-foreground">AI驱动的智能学习助手</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* 步骤指示器 */}
      <div className="bg-white border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {STEPS.map((step, index) => {
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ 
                      scale: isActive ? 1.05 : 1,
                      backgroundColor: isCompleted || isActive 
                        ? 'rgb(var(--primary))' 
                        : 'rgb(229 231 235)'
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full ${
                      isCompleted || isActive 
                        ? 'text-white' 
                        : 'text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                  </motion.div>
                  
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* 步骤0：上传内容 */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 输入区域 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    输入您的问题
                  </CardTitle>
                  <CardDescription>
                    输入您遇到的难题、不理解的知识点，或者上传相关图片
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="例如：请帮我解释一下什么是微积分？或者：这道数学题怎么解？..."
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    className="min-h-32 resize-none"
                  />

                  {/* 图片上传 */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      上传图片（可选）
                    </Label>
                    <ImageUploader
                      images={uploadedImages}
                      onAdd={addImage}
                      onRemove={removeImage}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 分类选择 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">选择学科分类</CardTitle>
                  <CardDescription>
                    选择问题所属学科，AI将提供更精准的解答
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategorySelector
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </CardContent>
              </Card>

              {/* 模型选择 */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">理解型 AI (1.AI)</CardTitle>
                    <CardDescription>
                      负责理解问题并生成解释
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ModelSelector
                      models={UNDERSTANDING_MODELS}
                      selected={selectedUnderstandingModel}
                      onSelect={setSelectedUnderstandingModel}
                      type="understanding"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">视频生成 AI (2.AI)</CardTitle>
                    <CardDescription>
                      根据理解结果生成教学视频
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ModelSelector
                      models={VIDEO_MODELS}
                      selected={selectedVideoModel}
                      onSelect={setSelectedVideoModel}
                      type="video"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 开始按钮 */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-12"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      开始生成
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* 步骤1-2：生成中 */}
          {(currentStep === 1 || currentStep === 2) && isGenerating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent"
              />
              <h2 className="text-2xl font-bold mt-6">{statusText}</h2>
              <p className="text-muted-foreground mt-2">请稍候，AI正在为您工作...</p>
              
              <div className="w-64 mt-6">
                <Progress value={progress} />
              </div>
            </motion.div>
          )}

          {/* 步骤3：完成 */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 成功提示 */}
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">生成完成！</h2>
              </div>

              {/* 结果展示 */}
              <ResultDisplay
                understanding={understanding}
                videoPrompt={videoPrompt}
                videoUrl={videoUrl}
                onRegenerate={handleGenerate}
              />

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={handleReset}>
                  <Upload className="w-4 h-4 mr-2" />
                  继续提问
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部信息 */}
      <footer className="border-t bg-white mt-auto">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 爱的教育 - AI驱动的智能学习助手
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                内容经AI审核，符合教育伦理标准
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* 设置对话框 */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
