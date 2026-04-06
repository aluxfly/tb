import { Tender } from "../types/tender";
import { Qualification, MatchResult } from "../types/qualification";

export type { MatchResult }; // 导出类型供其他模块使用

/**
 * 计算标讯与用户资质的匹配度
 * 匹配规则：
 * 1. 地区匹配：+30分
 * 2. 资质完全匹配：每匹配1项 +20分（满分100）
 * 3. 资质等级匹配：用户等级 ≥ 要求等级视为匹配
 */
export function calculateMatch(tender: Tender, userQualifications: Qualification[]): MatchResult {
  const matched: string[] = [];
  const missing: string[] = [];
  let score = 0;

  // 1. 地区匹配
  const userRegions = [...new Set(userQualifications.map((q) => q.region).filter((r) => r !== "全国"))];
  if (userRegions.includes(tender.region) || userRegions.includes("全国")) {
    score += 30;
  }

  // 2. 资质匹配
  for (const required of tender.requiredQualifications) {
    const isMatched = userQualifications.some((uq) => {
      // 完全包含匹配：用户资质名称包含招标要求
      const nameMatch = uq.name.includes(required) || required.includes(uq.name);
      if (!nameMatch) return false;

      // 等级检查（如有要求）
      if (tender.minQualificationLevel && uq.level) {
        return isQualificationLevelSufficient(uq.level, tender.minQualificationLevel);
      }
      return true;
    });

    if (isMatched) {
      matched.push(required);
      score += 20;
    } else {
      missing.push(required);
    }
  }

  // 限制最高100分
  score = Math.min(score, 100);

  // 检查是否有即将过期的资质
  const expiryAlerts = userQualifications.filter(
    (q) => (q.status === "expiring" || q.status === "expired") && matched.includes(q.name)
  ).length;

  return {
    tender,
    matchScore: score,
    matchedQualifications: matched,
    missingQualifications: missing,
    expiryAlerts,
  };
}

/**
 * 判断用户资质等级是否满足要求
 * 等级从高到低：一级 > 二级 > 三级 > 无
 */
function isQualificationLevelSufficient(userLevel: string, requiredLevel: string): boolean {
  const levelRank: Record<string, number> = {
    "一级": 4,
    "二级": 3,
    "三级": 2,
    "无": 1,
  };
  
  const userRank = levelRank[userLevel] || 0;
  const requiredRank = levelRank[requiredLevel] || 0;
  
  return userRank >= requiredRank;
}

/**
 * 按匹配度排序标讯
 */
export function sortByMatch(tenders: Tender[], userQualifications: Qualification[]): MatchResult[] {
  const matches = tenders.map((tender) => calculateMatch(tender, userQualifications));
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
