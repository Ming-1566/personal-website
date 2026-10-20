import { defaults } from '../data/defaults';
import { loadPostFiles } from '../data/content-loader';
import { createApi } from './client';
import { browserStorage } from './storage';

const files = import.meta.glob<string>('../content/posts/*.md', { query: '?raw', import: 'default', eager: true });
export const api = createApi(browserStorage, { ...defaults, posts: loadPostFiles(files) });
export const profileApi = api.profile;
export const skillsApi = api.skills;
export const projectsApi = api.projects;
export const postsApi = api.posts;
export const settingsApi = api.settings;
export const authApi = api.auth;
export const contactApi = api.contact;
export const backupApi = api.backup;
export { DEMO_CREDENTIALS } from './client';
export { ApiError } from './storage';
