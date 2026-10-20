import { useState } from 'react';
import { safeContentUrl } from '../../utils/content';

export function ContentCover({ src, title, variant = 'project' }: { src?: string; title: string; variant?: 'project' | 'post' }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const url = safeContentUrl(src, 'image');
  if (url && failedUrl !== url) return <img className="content-cover" src={url} alt={`${title}封面`} loading="lazy" onError={() => setFailedUrl(url)} />;
  return <div className={`cover-placeholder ${variant}`} role="img" aria-label={`${title}：封面待补充`}>
    <span className="eyebrow">{variant === 'project' ? 'PROJECT / 项目' : 'JOURNAL / 笔记'}</span>
    <svg viewBox="0 0 200 125" fill="none" aria-hidden="true"><path d="M15 104h170M30 93l38-61 30 42 31-57 42 76" stroke="currentColor" strokeWidth="1.5" /><circle cx="129" cy="17" r="4" fill="currentColor" /><circle cx="100" cy="62" r="44" stroke="currentColor" strokeDasharray="2 7" opacity=".4" /></svg>
    <span className="cover-caption">{src ? '封面无法加载' : '封面待补充'} · 示意占位</span>
  </div>;
}
