import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getMarkdownHeadings, remarkHeadingIds } from '../../utils/markdown';
import { safeContentUrl } from '../../utils/content';
import './markdown.css';

function MarkdownImage({ src, alt }: { src?: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  const safe = safeContentUrl(src, 'image');
  useEffect(() => setFailed(false), [src]);
  return !safe || failed ? <span className="markdown-image-fallback">图片暂不可用{alt ? `：${alt}` : ''}</span>
    : <img src={safe} alt={alt || '文章配图（未提供说明）'} loading="lazy" onError={() => setFailed(true)} />;
}

export default function MarkdownContent({ markdown, tocLabel = '文章目录' }: { markdown: string; tocLabel?: string }) {
  const headings = useMemo(() => getMarkdownHeadings(markdown), [markdown]);
  const [active, setActive] = useState('');
  const location = useLocation();
  useEffect(() => {
    setActive('');
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-100px 0px -60% 0px' });
    headings.forEach((heading) => { const node = document.getElementById(heading.id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [headings]);
  useEffect(() => {
    let id: string;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!id.startsWith('md-')) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [location.hash, markdown]);
  return <div className={`reading-layout ${headings.length ? '' : 'without-toc'}`}>
    {headings.length > 0 && <aside className="toc-sidebar"><details open><summary>{tocLabel}</summary><nav aria-label={tocLabel}>{headings.map((heading) => <a
      key={heading.id} href={`#${encodeURIComponent(heading.id)}`} className={active === heading.id ? 'active' : ''}
      aria-current={active === heading.id ? 'location' : undefined} style={{ paddingLeft: `${Math.min(heading.depth - 1, 3) * 12 + 12}px` }}>{heading.text}</a>)}</nav></details></aside>}
    <div className="markdown-body"><Markdown remarkPlugins={[remarkGfm, remarkHeadingIds]} rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
      skipHtml urlTransform={(url, key) => safeContentUrl(url, key === 'src' ? 'image' : 'link')}
      components={{
        h1: ({ id, children }) => <h2 id={id} className="markdown-h1">{children}</h2>,
        a: ({ href, children, title }) => {
          if (!href) return <span title="链接不可用">{children}</span>;
          if (/^https?:/i.test(href)) return <a href={href} title={title} target="_blank" rel="noopener noreferrer">{children}<span className="sr-only">（新窗口打开）</span></a>;
          return href.startsWith('#') || /^mailto:/i.test(href) ? <a href={href} title={title}>{children}</a> : <Link to={href} title={title}>{children}</Link>;
        },
        img: ({ src, alt }) => <MarkdownImage src={typeof src === 'string' ? src : undefined} alt={alt} />,
        table: ({ children }) => <div className="markdown-table" tabIndex={0} role="region" aria-label="文章表格，可左右滚动"><table>{children}</table></div>,
        pre: ({ children }) => <pre tabIndex={0} aria-label="代码块，可左右滚动">{children}</pre>,
      }}>{markdown}</Markdown></div>
  </div>;
}
