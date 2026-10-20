import { z } from 'zod';
import { contentSchema, profileSchema, skillSchema, projectSchema, postSchema, settingsSchema,
  stateSchema, sessionSchema, loginSchema, contactSchema, backupSchema } from '../schemas';
import type { Content, ContentState, DemoSession, Visibility } from '../types';
import { ApiError, readStored, writeStored, removeStored, storageKeys, validate } from './storage';
import type { StorageAdapter } from './storage';

// 公开的教学凭据，不是真实身份认证，不使用个人真实密码。
export const DEMO_CREDENTIALS = { username: 'demo', password: 'PortfolioDemo2026!' };
const emptyState = (): ContentState => ({ schemaVersion: 1, revision: 0,
  skills: { overrides: {}, deletedIds: [] }, projects: { overrides: {}, deletedIds: [] }, posts: { overrides: {}, deletedIds: [] } });

function merge<T extends { id: string }>(seed: T[], changes: { overrides: Record<string, T>; deletedIds: string[] }): T[] {
  const map = new Map(seed.map((entry) => [entry.id, entry]));
  Object.values(changes.overrides).forEach((entry) => map.set(entry.id, entry));
  changes.deletedIds.forEach((id) => map.delete(id));
  return [...map.values()];
}
function assertUnique(items: { id: string; slug?: string }[]): void {
  if (new Set(items.map((item) => item.id)).size !== items.length) throw new ApiError('VALIDATION', '内容编号重复。');
  const slugs = items.flatMap((item) => item.slug ? [item.slug] : []);
  if (new Set(slugs).size !== slugs.length) throw new ApiError('DUPLICATE_SLUG', '此链接名称已被其他内容使用。');
}

export function createApi(storage: StorageAdapter, inputDefaults: Content, now: () => number = Date.now) {
  const seed = validate(contentSchema, inputDefaults);
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const readState = () => readStored(storage, storageKeys.content, stateSchema, emptyState);
  const resolve = (state: ContentState): Content => {
    const result = validate(contentSchema, { profile: state.profileOverride ?? seed.profile,
      settings: state.settingsOverride ?? seed.settings,
      skills: merge(seed.skills, state.skills), projects: merge(seed.projects, state.projects), posts: merge(seed.posts, state.posts) });
    assertUnique(result.skills); assertUnique(result.projects); assertUnique(result.posts);
    return result;
  };
  const getSession = (): DemoSession | null => {
    let session: DemoSession | null;
    try { session = readStored(storage, storageKeys.session, sessionSchema.nullable(), () => null); }
    catch (error) {
      // 失效的演示会话按未登录处理；内容数据错误仍交给上层提示，不能静默清空。
      if (error instanceof ApiError && error.code === 'CORRUPT_DATA') return null;
      throw error;
    }
    return session && session.issuedAt <= now() && session.expiresAt > now() ? session : null;
  };
  const requireSession = () => { if (!getSession()) throw new ApiError('DEMO_UNAUTHENTICATED', '请先登录演示后台。'); };
  const commit = (change: (state: ContentState) => void) => {
    requireSession();
    const state = readState(); change(state); state.revision += 1;
    const valid = validate(stateSchema, state); resolve(valid);
    writeStored(storage, storageKeys.content, valid); notify();
  };
  function collection<T extends { id: string; slug?: string; status?: string }>(
    name: 'skills' | 'projects' | 'posts', schema: z.ZodType<T>,
  ) {
    const list = async (visibility: Visibility = 'published'): Promise<T[]> => {
      if (visibility === 'all') requireSession();
      const items = validate(z.array(schema), resolve(readState())[name]);
      return items.filter((item) => visibility === 'all' || !item.status || item.status === 'published');
    };
    return {
      list,
      getBySlug: async (slug: string, visibility: Visibility = 'published') => {
        const item = (await list(visibility)).find((entry) => entry.slug === slug);
        if (!item) throw new ApiError('NOT_FOUND', '未找到该内容，可能尚未发布。');
        return item;
      },
      getById: async (id: string) => {
        const item = (await list('all')).find((entry) => entry.id === id);
        if (!item) throw new ApiError('NOT_FOUND', '未找到该内容。');
        return item;
      },
      create: async (input: T) => {
        const item = validate(schema, input);
        commit((state) => {
          if (resolve(state)[name].some((entry) => entry.id === item.id)) throw new ApiError('VALIDATION', '内容编号已存在。');
          // 通用集合的类型参数与 name 在此绑定，外部只获得具体 schema 的操作。
          Object.assign(state[name].overrides, { [item.id]: item });
          state[name].deletedIds = state[name].deletedIds.filter((id) => id !== item.id);
        });
        return item;
      },
      update: async (id: string, input: T) => {
        const item = validate(schema, input);
        if (item.id !== id) throw new ApiError('VALIDATION', '编辑时不能更换内容编号。');
        commit((state) => {
          if (!resolve(state)[name].some((entry) => entry.id === id)) throw new ApiError('NOT_FOUND', '未找到要编辑的内容。');
          Object.assign(state[name].overrides, { [id]: item });
        });
        return item;
      },
      remove: async (id: string, confirmed: boolean) => {
        requireSession(); if (!confirmed) return false;
        commit((state) => {
          if (!resolve(state)[name].some((entry) => entry.id === id)) throw new ApiError('NOT_FOUND', '未找到要删除的内容。');
          delete state[name].overrides[id];
          if (!state[name].deletedIds.includes(id)) state[name].deletedIds.push(id);
        });
        return true;
      },
    };
  }
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    notifyExternalChange: notify,
    content: { get: async (): Promise<Content> => {
      const content = resolve(readState());
      return { ...content, projects: content.projects.filter((item) => item.status === 'published'),
        posts: content.posts.filter((item) => item.status === 'published') };
    } },
    profile: { get: async () => resolve(readState()).profile,
      update: async (input: Content['profile']) => {
        const profile = validate(profileSchema, input); commit((state) => { state.profileOverride = profile; }); return profile;
      } },
    settings: { get: async () => resolve(readState()).settings,
      update: async (input: Content['settings']) => {
        const settings = validate(settingsSchema, input); commit((state) => { state.settingsOverride = settings; }); return settings;
      } },
    skills: collection('skills', skillSchema), projects: collection('projects', projectSchema), posts: collection('posts', postSchema),
    backup: {
      exportContent: async () => {
        requireSession();
        return validate(backupSchema, { schemaVersion: 1, exportedAt: new Date(now()).toISOString(), resolvedContent: resolve(readState()) });
      },
      validateImport: async (input: unknown) => {
        requireSession(); const backup = validate(backupSchema, input);
        assertUnique(backup.resolvedContent.skills); assertUnique(backup.resolvedContent.projects); assertUnique(backup.resolvedContent.posts);
        return backup;
      },
      importContent: async (input: unknown, confirmed: boolean) => {
        requireSession(); if (!confirmed) return false;
        const backup = validate(backupSchema, input); const content = backup.resolvedContent;
        assertUnique(content.skills); assertUnique(content.projects); assertUnique(content.posts);
        const replacement = <T extends { id: string }>(items: T[], original: T[]) => ({
          overrides: Object.fromEntries(items.map((item) => [item.id, item])),
          deletedIds: original.filter((item) => !items.some((entry) => entry.id === item.id)).map((item) => item.id),
        });
        commit((state) => {
          state.profileOverride = content.profile; state.settingsOverride = content.settings;
          state.skills = replacement(content.skills, seed.skills);
          state.projects = replacement(content.projects, seed.projects);
          state.posts = replacement(content.posts, seed.posts);
        });
        return true;
      },
    },
    auth: {
      getSession: async () => getSession(),
      login: async (input: { username: string; password: string }) => {
        const credentials = validate(loginSchema, input);
        if (credentials.username !== DEMO_CREDENTIALS.username || credentials.password !== DEMO_CREDENTIALS.password)
          throw new ApiError('DEMO_UNAUTHENTICATED', '演示账号或密码不正确。');
        const session = { token: crypto.randomUUID(), username: credentials.username, issuedAt: now(), expiresAt: now() + 8 * 60 * 60 * 1000 };
        writeStored(storage, storageKeys.session, session); notify(); return session;
      },
      logout: async () => { removeStored(storage, storageKeys.session); notify(); },
    },
    contact: { create: async (input: { name: string; email: string; message: string }) => {
      const message = validate(contactSchema, { ...input, id: crypto.randomUUID(), createdAt: new Date(now()).toISOString() });
      const messages = readStored(storage, storageKeys.contact, z.array(contactSchema), () => []);
      writeStored(storage, storageKeys.contact, [...messages, message]); return message;
    } },
  };
}
export type PortfolioApi = ReturnType<typeof createApi>;
