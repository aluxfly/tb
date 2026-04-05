import Link from "next/link";
import tenders from "../public/data.json";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">智标通 · 中标预测演示</h1>
          <p className="text-sm text-gray-500 mt-1">基于AI的投标决策辅助系统</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">推荐标讯 ({tenders.length})</h2>
          <p className="text-sm text-gray-600">点击查看详细预测分析</p>
        </div>

        <div className="space-y-4">
          {tenders.map((tender) => (
            <Link
              key={tender.id}
              href={`/tender/${tender.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-2">
                    {tender.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      {tender.region}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded">
                      {tender.industry}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-700 rounded">
                      预算: {tender.budget}万元
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-500 mb-1">中标概率</p>
                    <p
                      className={`text-xl font-bold ${
                        tender.predictedWinRate >= 75
                          ? "text-green-600"
                          : tender.predictedWinRate >= 60
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {tender.predictedWinRate}%
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-500 mb-1">建议报价</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {tender.suggestedBidPrice}万
                    </p>
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                      查看详情 →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <p>智标通中标概率预测系统 · 演示版本</p>
        <p className="mt-1">数据仅为模拟，不代表真实投标建议</p>
      </footer>
    </div>
  );
}
