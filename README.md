# 智标通 MVP - 智能标讯匹配 + 资质管理

> 免费MVP版本：2-3天快速验证智能标讯匹配核心价值

## 🎯 核心功能

### 1. 智能标讯匹配
- 📊 从公开招标网站抓取标讯（初始用静态模拟数据，后续可接API）
- 🎯 基于企业资质（类型、等级、地区）自动计算匹配度
- 📈 按匹配度排序标讯，高匹配项目优先展示
- 📋 展示匹配详情：哪些资质已满足、哪些缺失

### 2. 资质管理
- ✏️ 企业可录入、编辑、删除资质证书
- ⏰ 有效期自动计算（提前30天告警）
- 🚨 资质过期自动标记为"无效"
- 💾 数据存储在浏览器本地（localStorage），无需登录

## 🚀 快速开始

### 本地运行

```bash
# 克隆或进入项目目录
cd smartbid-mvp

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev
# 访问 http://localhost:3000

# 生产构建
npm run build

# 启动生产服务器
npm start
```

### 首次使用流程

1. **首页** → 查看标讯列表（显示匹配度）
2. **点击"管理资质"** → 录入您的企业资质证书
3. **返回首页** → 查看个性化匹配结果
4. **点击标讯** → 查看详细的匹配分析

## 📊 数据说明

### 标讯数据
文件：`public/data.json`

```json
{
  "id": "tender-001",
  "title": "智慧城市物联网平台建设项目",
  "region": "北京市",
  "industry": "智慧城市",
  "budget": 850,
  "requiredQualifications": [
    "电子与智能化工程专业承包二级",
    "一级建造师（机电）",
    "ISO9001质量管理体系认证"
  ],
  "minQualificationLevel": "二级",
  "deadline": "2026-04-20",
  "description": "项目描述...",
  "sourceUrl": "https://www.ccgp.gov.cn"
}
```

添加新标讯：直接编辑 `public/data.json`，重新运行 `npm run build`。

### 资质数据
通过页面表单录入，自动保存在浏览器 localStorage：
- `smartbid_qualifications` 键

**字段说明：**
- `name`：资质完整名称（必须）
- `type`：资质类型（如：施工资质、设计资质、ISO认证等）
- `level`：资质等级（一级/二级/三级/无）
- `issuingAuthority`：发证机关
- `issueDate`：发证日期
- `expiryDate`：有效期至（用于自动计算过期状态）
- `region`：适用地区（全国/特定省份，匹配标讯所在地）
- `status`：（自动计算：valid/expiring/expired）

## 🔄 匹配算法

匹配度计算规则（满分100）：

| 规则 | 分值 | 说明 |
|------|------|------|
| 地区匹配 | +30 | 企业资质地区包含标讯所在地，或资质地区为"全国" |
| 资质匹配 | +20/项 | 企业资质名称包含标讯要求的资质条目 |
| 等级满足 | 额外权重 | 如要求"二级"，企业有"一级"也视为匹配 |

示例：
- 用户有3条资质匹配标讯要求 → 30 + 20×3 = 90分
- 地区不匹配 → 仅60分

## 📱 部署到 Vercel（免费）

### 一键部署（推荐）

1. Fork 本仓库到你的 GitHub 账号
2. 访问 [vercel.com/import](https://vercel.com/import)
3. 选择 Fork 后的仓库
4. 点击 **Deploy**
5. 获得免费 HTTPS 链接（如：`https://smartbid-mvp.你的用户名.vercel.app`）

### 手动部署

```bash
# 1. 登录 Vercel CLI
npm i -g vercel
vercel login

# 2. 部署
vercel --prod

# 3. 按提示确认部署
```

### 更新部署

代码修改后，重新 push 到 GitHub，Vercel 会自动重新构建部署。

## 🏗️ 项目结构

```
smartbid-mvp/
├── app/
│   ├── layout.tsx                  # 全局布局 + 导航栏
│   ├── page.tsx                    # 首页（标讯列表 + 匹配度计算）
│   ├── qualifications/
│   │   └── page.tsx                # 资质管理页面（CRUD + 过期告警）
│   └── tender/
│       └── [tenderId]/
│           └── page.tsx            # 标讯详情页（展示匹配分析）
├── lib/
│   ├── qualifications.ts           # localStorage 操作工具
│   └── match.ts                    # 匹配算法实现
├── public/
│   └── data.json                   # 模拟标讯数据（5条）
├── types/
│   ├── tender.ts                   # 标讯类型定义
│   └── qualification.ts            # 资质类型定义
├── package.json
├── tsconfig.json
├── next.config.ts
├── vercel.json                     # Vercel 部署配置
├── netlify.toml                    # Netlify 部署配置
└── README.md                       # 本文件
```

## ⚙️ 技术栈

- **框架**：Next.js 16 (App Router)
- **样式**：Tailwind CSS 4
- **语言**：TypeScript
- **存储**：localStorage（客户端）
- **部署**：Vercel / Netlify / Cloudflare Pages（全部免费）

## 🔒 MVP 限制说明

- ❌ 无用户登录系统（数据仅本地存储）
- ❌ 无后端数据库（无多端同步）
- ❌ 无真实API（标的源为模拟数据）
- ❌ 无自动推送（仅列表展示）
- ✅ 所有功能可在浏览器本地运行
- ✅ 完全免费托管（Vercel/Netlify）

**这不是完整产品，而是价值验证原型。**

## 📝 后续扩展方向

1. **真实标讯API**：接中招协/政府采购网API
2. **用户系统**：账号登录、数据云端同步
3. **推送功能**：每日邮件或站内信推送高匹配项目
4. **AI预测**：集成机器学习模型预测中标率
5. **团队协作**：多成员资质共享、标讯团队分析

## 🎁 Owner承诺

- ✅ 本日完成 Build 验证
- ✅ 响应式设计完成
- ✅ 可公开访问 URL（部署后）
- ✅ 代码提交 GitHub
- ✅ 文档完整（如何修改数据、如何重新部署）

---

© 2026 智标通团队 · 极简MVP

**问题反馈**：请提交 Issue 或联系开发团队
