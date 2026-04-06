# 部署指南

本文件提供智标通 MVP 的多种部署方案。

## ✅ 前置条件

- Node.js 18+ 已安装
- npm 包管理器可用
- 已运行 `npm install` 安装依赖

## 方案一：Vercel 一键部署（最推荐）

### 方式 A：通过 Vercel Dashboard（图形化）

1. 访问 https://vercel.com/new
2. 选择 "Import" 并授权 GitHub 访问
3. 选择本仓库 `smartbid-mvp`
4. 点击 "Deploy"
5. 等待部署完成，获得 HTTPS 链接

### 方式 B：通过 CLI（自动化）

```bash
# 1. 登录 Vercel（首次）
npx vercel login

# 2. 一键部署
./deploy.sh
# 或者手动：
npx vercel --prod
```

**优点**：完全免费、自动HTTPS、全球CDN、自动Git集成。

---

## 方案二：Netlify 部署

### 方式 A：Netlify Dashboard

1. 拖拽整个项目文件夹到 https://app.netlify.com/drop
2. 或点击 "New site from Git" 选择仓库
3. Netlify 会自动检测 Next.js 插件
4. 部署完成后获得链接

### 方式 B：Netlify CLI

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化项目
netlify init

# 部署
netlify deploy --prod --dir=.next
```

**注意**：需要 Netlify Next.js 插件（已包含在 netlify.toml）。

---

## 方案三：Cloudflare Pages

1. 访问 https://pages.cloudflare.com/
2. 点击 "Create a project" → "Connect to Git"
3. 选择仓库，配置构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Environment variables**: `NODE_VERSION=20`
4. 点击 "Save and Deploy"

**优点**：全球网络、免费额度充足、无供应商锁定。

---

## 方案四：自建服务器（Docker）

如果需要在自有服务器部署：

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY next.config.ts ./

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建镜像
docker build -t smartbid-mvp .

# 运行容器
docker run -p 3000:3000 smartbid-mvp
```

---

## 🔄 更新数据与重新部署

### 修改演示数据

编辑 `public/data.json`，添加/修改标讯数据。

### 重新部署（Vercel示例）

```bash
# 方式1：GitHub自动触发（推荐）
git add public/data.json
git commit -m "update: 修改演示数据"
git push origin master
# Vercel 会自动检测并重新部署

# 方式2：手动触发
npx vercel --prod
```

---

## 🐛 故障排查

### Build 失败

```bash
# 清理缓存重试
rm -rf node_modules .next
npm install
npm run build
```

### Vercel CLI 提示未登录

```bash
npx vercel login
# 按提示在浏览器确认
```

### 部署后页面空白

1. 检查浏览器控制台是否有错误
2. 确认 `public/data.json` 格式正确（JSON无语法错误）
3. Vercel 日志：`vercel logs <deployment-url>`

---

## 📊 验证清单

部署成功后，运行此清单：

- [ ] HTTPS 链接可访问
- [ ] 首页显示 3-5 条标讯列表
- [ ] 点击任意标讯可进入详情页
- [ ] 详情页显示：中标概率、建议报价、资质要求、预测依据、风险提示
- [ ] 手机端（Chrome DevTools 模拟）布局正常
- [ ] 页面加载速度 < 3秒

---

## 🎯 下一步

- [ ] 将仓库 URL 发送给相关方测试
- [ ] 收集用户反馈
- [ ] 规划 V2 功能（真实API、用户系统、付费功能）

---

**部署有疑问？** 阅读 README.md 或查看 Next.js 官方文档。