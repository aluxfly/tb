#!/bin/bash

# 智标通 MVP 一键部署脚本
# 使用方法：chmod +x deploy.sh && ./deploy.sh

set -e

echo "========================================="
echo "智标通 MVP - 一键部署"
echo "========================================="
echo ""

# 检查是否已登录Vercel
if ! npx vercel whoami > /dev/null 2>&1; then
  echo "⚠️  需要登录 Vercel 账号"
  npx vercel login
fi

echo ""
echo "📦 开始构建..."
npm run build

echo ""
echo "🚀 部署到 Vercel..."
echo "请注意：首次部署会询问以下问题："
echo "  - Set up and deploy? ❙ (Y)"
echo "  - Which scope? (选择你的账号)"
echo "  - Link to existing project? ❙ (N)"
echo "  - Project name? (smartbid-mvp)"
echo "  - In which directory is your code located? ❙ (./)"
echo ""

npx vercel --prod

echo ""
echo "✅ 部署完成！"
echo "访问链接见上方输出。"