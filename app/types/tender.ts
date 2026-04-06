export interface Tender {
  id: string;
  title: string;
  region: string;
  industry: string;
  budget: number;
  requiredQualifications: string[]; // 要求的资质列表，如 ["电子与智能化工程专业承包二级", "一级建造师"]
  minQualificationLevel?: string; // 最低资质等级要求（一、二、三级）
  deadline: string; // 投标截止时间
  description?: string;
  sourceUrl?: string;
}

export interface WinRateBadgeProps {
  rate: number;
}

export interface BidPriceProps {
  price: number;
}
