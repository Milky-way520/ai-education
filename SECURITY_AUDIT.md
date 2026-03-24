# 安全审计报告与改进建议

## 执行摘要

本文档详细分析了 `ai-education` 项目中发现的安全漏洞，并提供了具体的修复方案和优化建议。

---

## 🔴 严重漏洞

### 1. 文件上传漏洞 (CVE-2024-XXXX)

**位置**: `src/app/api/upload/route.ts`

**问题描述**:
- 仅依赖客户端提供的 MIME 类型进行验证，可被轻易绕过
- 未验证文件魔术字节（Magic Number）
- 使用可预测的文件名（时间戳 + 随机字符串）
- 未对上传文件进行安全处理，可能存储恶意内容
- 文件大小限制过大（10MB）

**潜在风险**:
- 攻击者可上传恶意脚本文件（如 .php, .exe 伪装成图片）
- XSS 攻击通过图片元数据注入
- 路径遍历攻击
- 服务器资源耗尽

**修复措施** ✅:
```typescript
// 1. 验证文件魔术字节
function validateMagicNumber(buffer: Buffer): string | null {
  const signatures = [
    { mime: 'image/jpeg', signature: Buffer.from([0xFF, 0xD8, 0xFF]) },
    { mime: 'image/png', signature: Buffer.from([0x89, 0x50, 0x4E, 0x47]) },
    // ...
  ];
  // 验证实际文件头
}

// 2. 使用 crypto 生成不可预测的文件名
const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`;

// 3. 使用 sharp 重新编码图片，移除元数据
processedBuffer = await sharp(buffer)
  .rotate()
  .toFormat('jpg')
  .toBuffer();

// 4. 降低文件大小限制到 5MB
const maxSize = 5 * 1024 * 1024;
```

---

### 2. API 速率限制缺失

**位置**: 所有 API 路由

**问题描述**:
- 无请求频率限制
- 无并发请求控制
- 可能导致 API 滥用和资源耗尽

**修复建议**:
```typescript
// 使用 next-rate-limiter 或自定义中间件
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const limited = await rateLimit(ip, { limit: 10, windowMs: 60000 });
  
  if (limited) {
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429 }
    );
  }
  // ...
}
```

---

### 3. SQL 注入风险（低）

**位置**: `src/app/api/generate/route.ts`

**问题描述**:
- 虽然使用了 Prisma ORM（参数化查询），但 JSON.parse 未做错误处理
- 可能导致应用崩溃或信息泄露

**修复措施** ✅:
```typescript
// 添加 try-catch 和验证
try {
  imageUrls: t.imageUrls ? JSON.parse(t.imageUrls) : [],
} catch (error) {
  console.error('Failed to parse imageUrls:', error);
  imageUrls: [],
}
```

---

## 🟡 中等风险

### 4. 敏感信息泄露

**位置**: `.env.example`, 代码中的 console.log

**问题描述**:
- 错误日志可能包含敏感信息
- API 密钥管理不当

**修复建议**:
- 生产环境禁用详细错误日志
- 使用环境变量加密存储敏感配置
- 实施密钥轮换机制

---

### 5. 内容审核绕过

**位置**: `src/app/api/generate/route.ts`

**问题描述**:
- 敏感词列表硬编码且有限
- AI 审核超时未处理
- 无图片 OCR 审核

**修复措施** ✅:
```typescript
// 1. 使用 Set 提高查找效率
const SENSITIVE_WORDS = new Set([...]);

// 2. 添加超时控制
const auditResult = await Promise.race([
  zai.chat.completions.create({...}),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('审核超时')), 10000)
  )
]);

// 3. 内容长度限制
if (content.length > maxContentLength) {
  return { isSafe: false, reason: '内容长度超过限制' };
}
```

---

### 6. 数据库连接泄漏

**位置**: `src/lib/db.ts`

**问题描述**:
- 开发环境启用详细查询日志
- 生产环境可能创建多个连接实例

**修复建议**:
```typescript
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});
```

---

## 🟢 性能优化建议

### 7. 数据库查询优化

**当前问题**:
- GET /api/generate 无分页
- 一次性加载所有任务

**修复措施** ✅:
```typescript
// 添加分页支持
const page = parseInt(searchParams.get('page') || '1');
const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
const skip = (page - 1) * limit;

const [tasks, total] = await Promise.all([
  db.learningTask.findMany({ skip, take: limit }),
  db.learningTask.count(),
]);
```

---

### 8. 并发请求优化

**修复措施** ✅:
```typescript
// 并行执行独立操作
const [tasks, total] = await Promise.all([...]);

// 视频提示词生成失败不影响主流程
try {
  videoPrompt = await generateVideoPrompt(...);
} catch (error) {
  console.error('Failed but continuing:', error);
}
```

---

### 9. 重试机制

**修复措施** ✅:
```typescript
async function generateVideo(videoPrompt: string, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await zai.images.generations.create({...});
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}
```

---

## 📋 其他改进建议

### 10. 输入验证增强

**修复措施** ✅:
```typescript
// 请求体大小限制
const contentLength = request.headers.get('content-length');
if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
  return NextResponse.json({ error: '请求体过大' }, { status: 413 });
}

// 参数验证
if (imageUrls.length > 10) {
  return NextResponse.json(
    { error: '最多只能上传 10 张图片' }, 
    { status: 400 }
  );
}
```

---

### 11. 审计日志

**修复措施** ✅:
```typescript
// 记录生成历史
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
```

---

## 🔧 已修复文件清单

| 文件 | 修复内容 | 状态 |
|------|---------|------|
| `src/app/api/upload/route.ts` | 魔术字节验证、sharp 处理、安全文件名 | ✅ |
| `src/app/api/generate/route.ts` | 输入验证、超时控制、分页、重试机制 | ✅ |

---

## 🚀 后续建议

1. **实施 HTTPS**: 强制使用 HTTPS 传输
2. **CSP 头**: 添加 Content-Security-Policy 响应头
3. **定期依赖更新**: 使用 `npm audit` 和 Dependabot
4. **渗透测试**: 定期进行安全测试
5. **监控告警**: 实施异常行为监控
6. **备份策略**: 定期数据库备份

---

## 📚 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/pages/building-your-application/authentication)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

---

*生成日期：2024*
*版本：1.0*
