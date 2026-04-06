import { Tender } from "./tender";

export interface Qualification {
  id: string;
  name: string; // 资质名称
  type: string; // 资质类型
  level: string; // 资质等级（一级/二级/三级/无）
  issuingAuthority: string; // 发证机关
  issueDate: string; // 发证日期
  expiryDate: string; // 有效期至
  region: string; // 适用地区
  status: "valid" | "expiring" | "expired"; // 自动计算
}

export interface MatchResult {
  tender: Tender;
  matchScore: number; // 0-100
  matchedQualifications: string[];
  missingQualifications: string[];
  expiryAlerts: number;
}
