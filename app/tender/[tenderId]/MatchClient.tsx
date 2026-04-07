"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tender, Qualification } from "../../types";
import { getQualifications } from "../../lib/qualifications";
import { calculateMatch } from "../../lib/match";

interface MatchClientProps {
  tender: Tender;
}

export default function MatchClient({ tender }: MatchClientProps) {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [matchResult, setMatchResult] = useState<ReturnType<typeof calculateMatch> | null>(null);

  useEffect(() => {
    const quals = getQualifications();
    setQualifications(quals);
    setMatchResult(calculateMatch(tender, quals));
  }, [tender]);

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

  if (!matchResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const { matchScore, matchedQualifications, missingQualifications } = matchResult;

  return (
    <>
      {/* 核心指标卡片 */}
      <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🎯</span> 匹配分析
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">匹配度</p>
            <div className="flex items-center justify-center gap-2">
              <p className={`text-2xl font-bold ${getScoreColor(matchScore).split(" ")[0]}`}>
                {matchScore}%
              </p>
            </div>
            <p className={`text-xs font-medium mt-1 ${getScoreColor(matchScore).split(" ")[1]}`}>
              {getScoreLabel(matchScore)}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">预算金额</p>
            <p className="text-2xl font-bold text-blue-700">{tender.budget}万</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">投标截止</p>
            <p className="text-2xl font-bold text-orange-700">{tender.deadline}</p>
          </div>
        </div>
      </div>

      {/* 匹配详情 */}
      {qualifications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🔍</span> 资质匹配详情
          </h2>
          
          {matchedQualifications.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-green-700 mb-2">✅ 已满足的资质要求</h3>
              <ul className="space-y-1">
                {matchedQualifications.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-green-600">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {missingQualifications.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-700 mb-2">❌ 缺失的资质要求</h3>
              <ul className="space-y-1">
                {missingQualifications.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-red-600">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {matchedQualifications.length === 0 && missingQualifications.length === 0 && tender.requiredQualifications && tender.requiredQualifications.length === 0 && (
            <p className="text-sm text-gray-500">该项目无特定资质要求</p>
          )}
        </div>
      )}

      {/* 资质要求 */}
      <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span> 资质要求
        </h2>
        {tender.requiredQualifications && tender.requiredQualifications.length > 0 ? (
          <ul className="space-y-2">
            {tender.requiredQualifications.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">该项目未设定特定资质要求</p>
        )}
      </div>

      {/* 项目描述 */}
      {tender.description && (
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📝</span> 项目描述
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{tender.description}</p>
        </div>
      )}

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
            <dd className="font-medium text-gray-900">{tender.region || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">所属行业</dt>
            <dd className="font-medium text-gray-900">{tender.industry || '-'}</dd>
          </div>
          {tender.minQualificationLevel && (
            <div>
              <dt className="text-gray-500">最低资质等级</dt>
              <dd className="font-medium text-gray-900">{tender.minQualificationLevel}</dd>
            </div>
          )}
          {tender.sourceUrl && (
            <div className="sm:col-span-2">
              <dt className="text-gray-500">信息来源</dt>
              <dd>
                <a href={tender.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  查看原公告
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4 pb-6">
        <Link
          href="/"
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
        >
          返回标讯列表
        </Link>
        {matchScore < 60 && (
          <a
            href="/qualifications"
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            补充资质以提高匹配
          </a>
        )}
      </div>
    </>
  );
}
