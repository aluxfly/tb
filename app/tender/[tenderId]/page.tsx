import { notFound } from "next/navigation";
import Link from "next/link";
import tenders from "../../../public/data.json";

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

export async function generateStaticParams() {
  return tenders.map((tender) => ({
    tenderId: tender.id,
  }));
}

export default async function TenderDetailPage({ params }: PageProps) {
  const { tenderId } = await params;
  const tender = tenders.find((t) => t.id === tenderId);

  if (!tender) {
    notFound();
  }

  const getWinRateColor = (rate: number) => {
    if (rate >= 75) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-yellow-500";
    return "bg-orange-500";
  };

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
        {/* 核心指标卡片 */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span> 预测核心指标
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">中标概率</p>
              <p className={`text-2xl font-bold ${getWinRateColor(tender.predictedWinRate)}`}>
                {tender.predictedWinRate}%
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">建议报价</p>
              <p className="text-2xl font-bold text-green-700">{tender.suggestedBidPrice}万</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">预算金额</p>
              <p className="text-2xl font-bold text-purple-700">{tender.budget}万</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">匹配度</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-bold text-orange-700">{tender.matchScore}</p>
                <p className="text-sm text-gray-500">分</p>
              </div>
            </div>
          </div>
        </div>

        {/* 资质要求 */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span> 资质要求
          </h2>
          <ul className="space-y-2">
            {tender.qualifications.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 预测依据 */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span> 预测依据
          </h2>
          <ul className="space-y-2">
            {tender.predictionBasis.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 风险提示 */}
        <div className="bg-white rounded-lg shadow p-5 border border-yellow-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">⚠️</span> 风险提示
          </h2>
          <ul className="space-y-2">
            {tender.risks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-yellow-800">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 p-3 bg-yellow-50 rounded text-xs text-yellow-800">
            ⚠️ 以上分析仅供参考，投标决策需结合实际情况，建议咨询专业顾问。
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📌</span> 项目信息
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">项目编号</dt>
              <dd className="font-medium text-gray-900">{tender.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">所属地区</dt>
              <dd className="font-medium text-gray-900">{tender.region}</dd>
            </div>
            <div>
              <dt className="text-gray-500">所属行业</dt>
              <dd className="font-medium text-gray-900">{tender.industry}</dd>
            </div>
            <div>
              <dt className="text-gray-500">预算金额</dt>
              <dd className="font-medium text-gray-900">{tender.budget} 万元</dd>
            </div>
          </dl>
        </div>

        {/* 返回按钮 */}
        <div className="flex justify-center pb-6">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            返回标讯列表
          </Link>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <p>智标通中标概率预测系统 · 演示版本</p>
        <p className="mt-1">数据仅为模拟，不代表真实投标建议</p>
      </footer>
    </div>
  );
}