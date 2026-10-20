import type { z } from 'zod';
import type { profileSchema, skillSchema, projectSchema, postSchema, settingsSchema,
  sessionSchema, contactSchema, contentSchema, stateSchema, backupSchema } from '../schemas';

export type Profile = z.infer<typeof profileSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Post = z.infer<typeof postSchema>;
export type SiteSettings = z.infer<typeof settingsSchema>;
export type DemoSession = z.infer<typeof sessionSchema>;
export type ContactMessage = z.infer<typeof contactSchema>;
export type Content = z.infer<typeof contentSchema>;
export type ContentState = z.infer<typeof stateSchema>;
export type ContentBackup = z.infer<typeof backupSchema>;
export type Visibility = 'published' | 'all';
export type CollectionName = 'skills' | 'projects' | 'posts';
