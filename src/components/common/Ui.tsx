import type { ReactNode } from 'react';
import { Link } from 'react-router';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
export function PageHeading({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return <header className="page-heading"><span className="eyebrow">{label}</span><h1>{title}</h1>{children && <p>{children}</p>}</header>;
}
export function StageNote({ children }: { children: ReactNode }) {
  return <div className="stage-note"><span className="status-dot" />{children}</div>;
}
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty-state"><span className="empty-symbol" aria-hidden="true">＋</span><h2>{title}</h2><p>{children}</p></div>;
}
export function NotFoundPage() {
  return <section className="container section"><PageHeading label="404 / NOT FOUND" title="这里还没有内容。">页面不存在，或内容尚未发布。</PageHeading>
    <Link className="button primary" to="/">返回首页 <Arrow /></Link></section>;
}
