"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Tender, Qualification } from "./types";
import { getQualifications } from "./lib/qualifications";
import { sortByMatch, MatchResult } from "./lib/match";
import { BidGenerator } from "./lib/bid-generator";

export default function Home() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [matchedResults, setMatchedResults] = useState<MatchResult[]>([]);
  const [showMatches, setShowMatches] = useState(true);

  useEffect(() => {
    // 加载标讯数据
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setTenders(data));
    
    // 加载用户资质
    setQualifications(getQualifications());
  }, []);

  useEffect(() => {
    if (tenders.length > 0) {
      const results = sortByMatch(tenders, qualifications);
      setMatchedResults(results);
    }
  }, [tenders, qualifications]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "高匹配";
    if (score >= 60) return "中匹配";
    return "低匹配";
  };

  // 生成标书（针对某个招标）
  const generateBidDocument = async (tender: Tender) => {
    if (qualifications.length === 0) {
      alert("请先录入企业资质信息（点击右上角「管理资质」）");
      return;
    }

    try {
      const generator = new BidGenerator(tender, qualifications);
      const blob = await generator.generateDocx("/bid-templates/tech-bid-template.docx");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const companyName = qualifications[0]?.name || "未命名企业";
      link.download = `标书_${tender.id}_${companyName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("标书生成失败:", error);
      alert("标书生成失败，请检查控制台日志");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">智标通</h1>
              <p className="text-sm text-gray-500 mt-1">基于资质的智能标讯匹配系统</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">我的资质</p>
                <p className="text-lg font-semibold text-indigo-600">{qualifications.length} 条</p>
              </div>
              <a
                href="/qualifications"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                管理资质
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="text-sm text-gray-500">标讯总数</div>
            <div className="text-2xl font-bold text-gray-900">{tenders.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="text-sm text-gray-500">高匹配项目 (≥80分)</div>
            <div className="text-2xl font-bold text-green-600">
              {matchedResults.filter((r) => r.matchScore >= 80).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="text-sm text-gray-500">需补充的资质</div>
            <div className="text-2xl font-bold text-red-600">
              {matchedResults.reduce((acc, r) => acc + r.missingQualifications.length, 0)}
            </div>
          </div>
        </div>

        {/* 说明卡片 */}
        {qualifications.length === 0 && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  您还未录入任何资质。请
                  <a href="/qualifications" className="font-medium underline ml-1">点击这里添加资质</a>
                  以查看个性化匹配结果。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 标讯列表 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            推荐标讯 ({matchedResults.length})
          </h2>
          <p className="text-sm text-gray-600">
            匹配度基于您已录入的资质自动计算 · 点击查看详情
          </p>
        </div>

        <div className="space-y-4">
          {matchedResults.map(({ tender, matchScore, matchedQualifications, missingQualifications }) => (
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
                    {tender.minQualificationLevel && (
                      <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded">
                        最低等级: {tender.minQualificationLevel}
                      </span>
                    )}
                  </div>

                  {/* 匹配详情 */}
                  {qualifications.length > 0 && (
                    <div className="text-xs text-gray-600">
                      {matchedQualifications.length > 0 && (
                        <div className="mb-1">
                          <span className="text-gray-500">匹配资质：</span>
                          {matchedQualifications.map((m, i) => (
                            <span key={i} className="text-green-600 mr-2">✓ {m}</span>
                          ))}
                        </div>
                      )}
                      {missingQualifications.length > 0 && (
                        <div>
                          <span className="text-gray-500">缺失资质：</span>
                          {missingQualifications.map((m, i) => (
                            <span key={i} className="text-red-500 mr-2">✗ {m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-500 mb-1">匹配度</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold px-2 py-1 rounded ${getScoreColor(matchScore)}`}>
                        {matchScore}%
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getScoreColor(matchScore).split(" ")[1]}`}>
                        {getScoreLabel(matchScore)}
                      </span>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-500 mb-1">投标截止</p>
                    <p className="text-sm font-semibold text-gray-900">{tender.deadline}</p>
                  </div>
                  <div className="mt-1 space-y-1">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                      查看详情 →
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // 阻止链接跳转
                        generateBidDocument(tender);
                      }}
                      className="w-full inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      📥 生成标书
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 空状态 */}
        {matchedResults.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <p className="text-gray-500">暂无标讯数据</p>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <p>智标通 MVP · 智能标讯匹配演示</p>
        <p className="mt-1">数据仅为模拟，不代表真实投标建议</p>
      </footer>
    </div>
  );
}
