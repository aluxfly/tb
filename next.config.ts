import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/tb',  // 仓库名为 tb，所以 basePath 为 /tb
  images: {
    unoptimized: true, // GitHub Pages 不支持 next/image 优化
  },
};

export default nextConfig;
