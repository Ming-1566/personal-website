import { Component, lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

const MarkdownContent = lazy(() => import('./MarkdownContent'));

class ReadingBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="empty-state" role="alert"><h2>正文暂时未能加载</h2><p>请刷新重试，当前页面地址会保留。</p><button className="button secondary" onClick={() => window.location.reload()}>刷新正文</button></div> : this.props.children;
  }
}

export function MarkdownLoader({ markdown, tocLabel }: { markdown: string; tocLabel?: string }) {
  return <ReadingBoundary key={markdown}><Suspense fallback={<p role="status">正在排版正文…</p>}><MarkdownContent markdown={markdown} tocLabel={tocLabel} /></Suspense></ReadingBoundary>;
}
