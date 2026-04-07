import { Tender } from "../../types";
import MatchClient from "./MatchClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { readFile } from "fs/promises";
import path from "path";

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

// 静态生成所有可能的路由
export async function generateStaticParams() {
  try {
    // 读取 public/data.json
    const filePath = path.join(process.cwd(), 'public', 'data.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const tenders: any[] = JSON.parse(fileContent).data || [];
    return tenders.map((tender: any) => ({
      tenderId: tender.id || tender.projectNo,
    }));
  } catch (error) {
    console.warn('无法加载 data.json 生成静态参数:', error);
    return [];
  }
}

export default async function TenderDetailPage({ params }: PageProps) {
  const { tenderId } = await params;

  // 从 public/data.json 读取 tender 数据
  let tender: Tender | null = null;
  try {
    const filePath = path.join(process.cwd(), 'public', 'data.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const json = JSON.parse(fileContent);
    const tenders: any[] = json.data || [];
    tender = tenders.find(t => (t.id || t.projectNo) === tenderId) || null;
  } catch (error) {
    console.error('加载 tender 数据失败:', error);
  }

  if (!tender) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 返回列表
          </Link>
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {tender.title}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <MatchClient tender={tender} />
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <p>智标通 MVP · 标讯详情</p>
        <p className="mt-1">匹配度基于您已录入的资质计算 · 数据存储在本地浏览器</p>
      </footer>
    </div>
  );
}
