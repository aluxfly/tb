"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Tender, Qualification } from "../../types";
import { getQualifications } from "../../lib/qualifications";
import { calculateMatch } from "../../lib/match";

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

export default function TenderDetailPage({ params }: PageProps) {
  const { tenderId } = use(params);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [matchResult, setMatchResult] = useState<ReturnType<typeof calculateMatch> | null>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        setTenders(data);
        if (data.length > 0) {
          const tender = data.find((t: Tender) => t.id === tenderId);
          if (tender) {
            const quals = getQualifications();
            setQualifications(quals);
            setMatchResult(calculateMatch(tender, quals));
          }
        }
      });
  }, [tenderId]);

  // 生成标书（DOCX下载）
  const generateBidDocument = async () => {
    if (!tender || qualifications.length === 0) {
      alert("请先完善企业资质信息");
      return;
    }

    try {
      // 动态加载 docxtemplater 库（避免 SSR 问题）
      const { default: Docxtemplater } = await import("docxtemplater");
      const { pizZip } = await import("pizzip");

      // 加载模板
      const response = await fetch("/bid-templates/tech-bid-template.docx");
      const arrayBuffer = await response.arrayBuffer();
      const zip = new pizZip(arrayBuffer);
      const doc = new Docxtemplater();
      doc.loadZip(zip);

      // 准备数据
      const companyName = qualifications[0]?.name || "未命名企业";
      const qualificationNames = qualifications.map(q => q.name).join("、");
      const currentDate = new Date().toLocaleDateString("zh-CN");

      // 填充模板变量（根据模板实际变量名调整）
      const data = {
        tender: {
          title: tender.title,
          id: tender.id,
          budget: tender.budget,
          deadline: tender.deadline,
          region: tender.region,
          industry: tender.industry,
          description: tender.description || "无",
          requiredQualifications: tender.requiredQualifications.join("；") || "无",
        },
        company: {
          name: companyName,
          qualifications: qualificationNames,
          matchScore: matchResult?.matchScore || 0,
        },
        meta: {
          generatedDate: currentDate,
          generator: "智标通 MVP",
        },
      };

      doc.setData(data);
      doc.render();

      // 生成 DOCX 文件
      const updatedZip = doc.getZip();
      const blob = updatedZip.generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=utf-8",
      });

      // 触发下载
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
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

  const { tender, matchScore, matchedQualifications, missingQualifications } = matchResult;

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

            {matchedQualifications.length === 0 && missingQualifications.length === 0 && tender.requiredQualifications.length === 0 && (
              <p className="text-sm text-gray-500">该项目无特定资质要求</p>
            )}
          </div>
        )}

        {/* 资质要求 */}
        <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span> 资质要求
          </h2>
          {tender.requiredQualifications.length > 0 ? (
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
              <dd className="font-medium text-gray-900">{tender.region}</dd>
            </div>
            <div>
              <dt className="text-gray-500">所属行业</dt>
              <dd className="font-medium text-gray-900">{tender.industry}</dd>
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
          <button
            onClick={generateBidDocument}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>📥</span> 生成标书
          </button>
        </div>

        {/* 隐藏的模板加载（用于标书生成） */}
        <div id="bid-template-container" style={{ display: "none" }}></div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <p>智标通 MVP · 标讯详情</p>
        <p className="mt-1">匹配度基于您已录入的资质计算 · 数据存储在本地浏览器</p>
      </footer>
    </div>
  );
}
