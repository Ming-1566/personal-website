import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { usePortfolio } from '../../state/usePortfolio';
import { PageHeading, EmptyState, NotFoundPage, Arrow } from '../../components/common/Ui';
import { ContentCover } from '../../components/public/ContentCover';
import { formatDate, safeContentUrl } from '../../utils/content';
import type { Post, Project } from '../../types';
import { MarkdownLoader } from '../../components/markdown/MarkdownLoader';

export function ProjectCard({ project }: { project: Project }) {
  return <article className="project-card"><Link to={`/projects/${project.slug}`} aria-label={`查看${project.title}`}><ContentCover src={project.coverUrl} title={project.title} /></Link>
    <div className="project-card-body"><div className="card-meta"><span>{project.deliveryStatus || '状态待填写'}</span><span>{formatDate(project.date, project.dateLabel || '日期待填写')}</span></div>
      <h2><Link to={`/projects/${project.slug}`}>{project.title}</Link></h2><p>{project.summary || '项目摘要待填写。'}</p>
      <div className="tag-list">{project.tags.length ? project.tags.map((tag) => <span key={tag}>{tag}</span>) : <span className="missing-tag">技术标签待补充</span>}</div>
      <Link to={`/projects/${project.slug}`} className="inline-link">了解项目 <Arrow diagonal /></Link></div>
  </article>;
}
export function PostCard({ post }: { post: Post }) {
  return <article className="post-card"><div className="card-meta"><time dateTime={post.date}>{formatDate(post.date)}</time><span>学习笔记</span></div>
    {post.coverUrl && <Link to={`/blog/${post.slug}`} aria-label={`阅读${post.title}`}><ContentCover src={post.coverUrl} title={post.title} variant="post" /></Link>}
    <h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.summary || '摘要待填写。'}</p>
    <div className="tag-list">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><Link to={`/blog/${post.slug}`} className="inline-link">阅读笔记 <Arrow /></Link></article>;
}
export function ProjectsPage() {
  const { content } = usePortfolio();
  const [query, setQuery] = useState('');
  const items = [...(content?.projects ?? [])].sort((a, b) => a.order - b.order);
  const projects = items.filter((item) => `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="container section listing-page"><PageHeading label="PROJECTS / 项目" title="实践中的作品">从想法到实现，记录已经完成的探索。</PageHeading>
    <div className="listing-toolbar"><p>{items.length} 个已发布项目</p><div><label className="sr-only" htmlFor="project-search">搜索项目</label><input id="project-search" type="search" placeholder="搜索项目或技术标签" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
    {projects.length ? <div className="project-grid">{projects.map((item) => <ProjectCard project={item} key={item.id} />)}</div> : <EmptyState title={items.length ? '没有找到匹配项目' : '项目正在准备中'}>{items.length ? '尝试其他关键词，或清空搜索内容。' : '新项目发布后将在这里展示。'}</EmptyState>}
  </section>;
}
export function ProjectDetailPage() {
  const { slug } = useParams();
  const { content } = usePortfolio();
  const project = content?.projects.find((item) => item.slug === slug);
  if (!project) return <NotFoundPage />;
  const demo = safeContentUrl(project.demoUrl); const repo = safeContentUrl(project.repoUrl);
  return <article className="container section detail-page"><Link to="/projects" className="back-link">← 返回项目</Link>
    <PageHeading label="PROJECT / 项目详情" title={project.title}>{project.summary}</PageHeading>
    <div className="project-detail-intro"><ContentCover src={project.coverUrl} title={project.title} /><div className="project-facts"><dl>
      <div><dt>项目状态</dt><dd>{project.deliveryStatus || '待填写'}</dd></div><div><dt>项目时间</dt><dd>{formatDate(project.date, project.dateLabel || '日期待填写')}</dd></div>
      <div><dt>本人职责</dt><dd>{project.role || '待填写'}</dd></div><div><dt>技术栈</dt><dd>{project.tags.length ? project.tags.join(' / ') : '待填写'}</dd></div>
      <div><dt>相关成果</dt><dd>{project.achievement || '待填写'}</dd></div></dl>
      <div className="project-link-actions">{demo ? <a className="button primary" href={demo} target="_blank" rel="noopener noreferrer">访问项目 <Arrow diagonal /></a> : <p>演示地址待补充</p>}
        {repo ? <a className="button secondary" href={repo} target="_blank" rel="noopener noreferrer">代码仓库 <Arrow diagonal /></a> : <p>仓库地址待补充</p>}</div></div></div>
    <div className="detail-divider"><span className="eyebrow">PROJECT NOTES / 项目说明</span></div>
    <MarkdownLoader markdown={project.bodyMarkdown || '项目正文待填写。'} tocLabel="项目目录" />
    <div className="detail-bottom"><Link to="/projects" className="inline-link">← 查看全部项目</Link><Link to="/#contact" className="inline-link">联系我 <Arrow /></Link></div>
  </article>;
}
export function BlogPage() {
  const { content } = usePortfolio();
  const [query, setQuery] = useState(''); const [tag, setTag] = useState('');
  const posts = [...(content?.posts ?? [])].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  const tags = [...new Set(posts.flatMap((post) => post.tags))];
  const filtered = posts.filter((post) => (!tag || post.tags.includes(tag)) && `${post.title} ${post.summary} ${post.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="container section listing-page"><PageHeading label="JOURNAL / 博客" title="记录思考，也记录成长。">关于学习、开发与图像方向的笔记。</PageHeading>
    {posts.length > 0 && <><div className="listing-toolbar"><p>{filtered.length} / {posts.length} 篇笔记</p><div><label className="sr-only" htmlFor="blog-search">搜索博客</label><input id="blog-search" type="search" placeholder="搜索标题、摘要或标签" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
      {tags.length > 0 && <div className="filter-tags" role="group" aria-label="按标签筛选"><button aria-pressed={!tag} onClick={() => setTag('')}>全部</button>{tags.map((value) => <button key={value} aria-pressed={tag === value} onClick={() => setTag(value)}>{value}</button>)}</div>}</>}
    {filtered.length ? <div className="post-grid">{filtered.map((post) => <PostCard post={post} key={post.id} />)}</div> : <EmptyState title={posts.length ? '没有找到匹配笔记' : '第一篇笔记，正在准备中。'}>{posts.length ? '尝试其他关键词或标签。' : '目前没有已发布文章。待真实学习笔记准备好后，这里会展示文章；暂不填入虚构内容。'}</EmptyState>}
  </section>;
}
export function BlogDetailPage() {
  const { slug } = useParams();
  const { content } = usePortfolio();
  const post = content?.posts.find((item) => item.slug === slug);
  if (!post) return <NotFoundPage />;
  return <article className="container section detail-page"><Link to="/blog" className="back-link">← 返回博客</Link><PageHeading label="JOURNAL / 学习笔记" title={post.title}>{post.summary}</PageHeading>
    <div className="article-meta"><time dateTime={post.date}>{formatDate(post.date)}</time><div className="tag-list">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
    {post.coverUrl && <div className="article-cover"><ContentCover src={post.coverUrl} title={post.title} variant="post" /></div>}
    <MarkdownLoader markdown={post.bodyMarkdown || '正文待填写。'} />
    <div className="detail-bottom"><Link to="/blog" className="inline-link">← 查看全部笔记</Link><Link to="/#contact" className="inline-link">交流想法 <Arrow /></Link></div>
  </article>;
}
