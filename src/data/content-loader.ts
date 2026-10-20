import { parse } from 'yaml';
import { postSchema } from '../schemas';
import type { Post } from '../types';

export function parsePostFile(raw: string, path: string): Post {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(raw);
  if (!match) throw new Error(`${path}：缺少 YAML frontmatter`);
  const meta: unknown = parse(match[1]);
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new Error(`${path}：文章元信息格式不正确`);
  const fields = meta as Record<string, unknown>;
  const result = postSchema.safeParse({ ...fields, bodyMarkdown: match[2].trim(), source: 'file',
    updatedAt: fields.updatedAt ?? `${String(fields.date)}T00:00:00.000Z` });
  if (!result.success) throw new Error(`${path}：${result.error.issues.map((item) => `${item.path.join('.')} ${item.message}`).join('；')}`);
  return result.data;
}

export function loadPostFiles(files: Record<string, string>): Post[] {
  const posts = Object.entries(files).map(([path, raw]) => parsePostFile(raw, path));
  for (const field of ['id', 'slug'] as const) {
    if (new Set(posts.map((post) => post[field])).size !== posts.length) throw new Error(`文件文章的 ${field} 重复`);
  }
  return posts;
}
