import { z } from 'zod';

const text = z.string().trim().min(1, '请填写此项').max(300, '内容过长');
const optionalText = z.string().trim().max(1000).optional();
const id = z.string().trim().min(1).max(100);
const date = z.iso.date();
const resourceUrl = z.string().refine((value) => {
  if (!value) return true;
  if (/^\/(?!\/)/.test(value) && !value.includes('\\')) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}, '请使用有效的网页地址或站内路径').optional();
const tags = z.array(text).max(30).transform((items) => [...new Set(items)]);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '使用小写英文、数字和连字符');

export const profileSchema = z.object({
  name: text, tagline: text, bio: z.string().trim().max(5000), avatarUrl: resourceUrl,
  major: optionalText, studyStage: optionalText, researchDirections: tags, interests: tags,
  education: z.array(z.object({ id, school: optionalText, major: optionalText, degree: optionalText,
    startDate: date.optional(), endDate: date.optional(), description: optionalText })),
  experiences: z.array(z.object({ id, title: text, organization: optionalText,
    startDate: date.optional(), endDate: date.optional(), description: z.string().max(5000) })),
  email: z.email('请填写有效邮箱'),
  socialLinks: z.array(z.object({ id, label: text, url: z.url().refine((url) => /^https?:/.test(url)) })),
  resumeUrl: resourceUrl,
});
export const skillSchema = z.object({ id, name: text, category: text,
  proficiencyLabel: optionalText, iconKey: optionalText, order: z.number().int().nonnegative() });
const entryFields = {
  id, slug, title: text, summary: z.string().trim().max(300), bodyMarkdown: z.string().max(100000),
  tags, coverUrl: resourceUrl, date: date.optional(), status: z.enum(['draft', 'published']),
  updatedAt: z.iso.datetime(),
};
export const projectSchema = z.object({ ...entryFields, dateLabel: optionalText,
  deliveryStatus: optionalText, achievement: optionalText, role: optionalText,
  demoUrl: resourceUrl, repoUrl: resourceUrl, order: z.number().int().nonnegative() });
export const postSchema = z.object({ ...entryFields, source: z.enum(['file', 'local']) })
  .refine((post) => post.status !== 'published' || !!post.date,
    { message: '发布文章前请填写日期', path: ['date'] });
export const settingsSchema = z.object({ title: text, description: z.string().max(500),
  accentColor: z.string().regex(/^#[\da-fA-F]{6}$/), footerText: text,
  starfieldEnabled: z.boolean(), socialDisplayEnabled: z.boolean() });
export const sessionSchema = z.object({ token: z.uuid(), username: text,
  issuedAt: z.number().int(), expiresAt: z.number().int() });
export const loginSchema = z.object({ username: text, password: z.string().min(1, '请输入演示密码') });
export const contactFormSchema = z.object({ name: z.string().trim().min(1, '请填写称呼').max(100, '称呼最多100字'),
  email: z.email('请填写有效邮箱'), message: z.string().trim().min(1, '请填写留言').max(2000, '留言最多2000字') });
export const contactSchema = contactFormSchema.extend({ id, createdAt: z.iso.datetime() });
export const contentSchema = z.object({ profile: profileSchema, skills: z.array(skillSchema),
  projects: z.array(projectSchema), posts: z.array(postSchema), settings: settingsSchema });
const changes = <T extends z.ZodType>(schema: T) => z.object({
  overrides: z.record(z.string(), schema), deletedIds: z.array(id),
});
export const stateSchema = z.object({ schemaVersion: z.literal(1), revision: z.number().int().nonnegative(),
  profileOverride: profileSchema.optional(), settingsOverride: settingsSchema.optional(),
  skills: changes(skillSchema), projects: changes(projectSchema), posts: changes(postSchema) });
export const backupSchema = z.object({ schemaVersion: z.literal(1), exportedAt: z.iso.datetime(),
  resolvedContent: contentSchema });
