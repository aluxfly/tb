import { Qualification } from "../types/qualification";

const STORAGE_KEY = "smartbid_qualifications";

export function getQualifications(): Qualification[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveQualifications(qualifications: Qualification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(qualifications));
}

export function addQualification(q: Omit<Qualification, "id" | "status">): Qualification {
  const qualifications = getQualifications();
  const newQual: Qualification = {
    ...q,
    id: `qual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: calculateStatus(q.expiryDate),
  };
  qualifications.push(newQual);
  saveQualifications(qualifications);
  return newQual;
}

export function updateQualification(id: string, updates: Partial<Qualification>): Qualification | null {
  const qualifications = getQualifications();
  const index = qualifications.findIndex((q) => q.id === id);
  if (index === -1) return null;
  
  const updated = { ...qualifications[index], ...updates };
  if (updates.expiryDate) {
    updated.status = calculateStatus(updates.expiryDate);
  }
  
  qualifications[index] = updated;
  saveQualifications(qualifications);
  return updated;
}

export function deleteQualification(id: string): boolean {
  const qualifications = getQualifications();
  const filtered = qualifications.filter((q) => q.id !== id);
  if (filtered.length === qualifications.length) return false;
  saveQualifications(filtered);
  return true;
}

function calculateStatus(expiryDate: string): "valid" | "expiring" | "expired" {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysDiff = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) return "expired";
  if (daysDiff <= 30) return "expiring";
  return "valid";
}

export function getExpiryAlertCount(): number {
  const qualifications = getQualifications();
  return qualifications.filter((q) => q.status === "expiring" || q.status === "expired").length;
}
