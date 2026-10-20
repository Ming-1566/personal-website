import { z } from 'zod';

export type ApiErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'DUPLICATE_SLUG' | 'DEMO_UNAUTHENTICATED'
  | 'STORAGE_UNAVAILABLE' | 'QUOTA_EXCEEDED' | 'CORRUPT_DATA' | 'UNSUPPORTED_VERSION';
export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message: string) { super(message); this.name = 'ApiError'; }
}
export interface StorageAdapter { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export const storageKeys = { content: 'wyh-portfolio:content:v1', session: 'wyh-portfolio:session:v1', contact: 'wyh-portfolio:contact:v1' };

export function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ApiError('VALIDATION', result.error.issues.map((issue) => `${issue.path.join('.') || '内容'}：${issue.message}`).join('；'));
  return result.data;
}
export function readStored<T>(storage: StorageAdapter, key: string, schema: z.ZodType<T>, fallback: () => T): T {
  let raw: string | null;
  try { raw = storage.getItem(key); } catch { throw new ApiError('STORAGE_UNAVAILABLE', '无法读取浏览器存储，请检查浏览器设置。'); }
  if (raw === null) return fallback();
  try {
    const value: unknown = JSON.parse(raw);
    if (key === storageKeys.content && value && typeof value === 'object'
      && 'schemaVersion' in value && value.schemaVersion !== 1) {
      throw new ApiError('UNSUPPORTED_VERSION', '本地数据版本暂不支持，原数据已保留。');
    }
    const parsed = schema.safeParse(value);
    if (!parsed.success) throw new Error('invalid');
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('CORRUPT_DATA', '本地数据无法识别，原数据已保留，请先备份再处理。');
  }
}
export function writeStored(storage: StorageAdapter, key: string, value: unknown): void {
  try { storage.setItem(key, JSON.stringify(value)); }
  catch (error) {
    const quota = error instanceof Error && error.name === 'QuotaExceededError';
    throw new ApiError(quota ? 'QUOTA_EXCEEDED' : 'STORAGE_UNAVAILABLE', quota ? '浏览器存储空间不足，未保存修改。' : '浏览器存储写入失败，未保存修改。');
  }
}
export function removeStored(storage: StorageAdapter, key: string): void {
  try { storage.removeItem(key); } catch { throw new ApiError('STORAGE_UNAVAILABLE', '无法清除演示会话，请检查浏览器设置。'); }
}
export const browserStorage: StorageAdapter = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: (key) => window.localStorage.removeItem(key),
};
