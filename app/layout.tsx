import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "智标通 · 智能标讯匹配与资质管理系统",
  description: "基于企业资质的智能标讯匹配系统，告别盲目投标，精准匹配项目",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        {/* 全局导航 */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-14">
              <div className="flex items-center space-x-6">
                <a href="/" className="text-lg font-bold text-gray-900">智标通</a>
                <div className="hidden md:flex space-x-4 text-sm">
                  <a href="/" className="text-gray-600 hover:text-indigo-600 px-2 py-1 rounded">标讯推荐</a>
                  <a href="/qualifications" className="text-gray-600 hover:text-indigo-600 px-2 py-1 rounded">资质管理</a>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                MVP免费版 · 数据存储在本地
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
