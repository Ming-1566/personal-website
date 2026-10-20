import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { usePortfolio } from '../state/usePortfolio';
import { Arrow } from '../components/common/Ui';
import { Starfield } from '../components/public/Starfield';
import { useReducedMotion } from '../utils/useReducedMotion';
import { safeContentUrl } from '../utils/content';

export function PublicLayout() {
  const { content } = usePortfolio();
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [section, setSection] = useState('');
  const reduced = useReducedMotion();
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      let id: string;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      document.getElementById(id)?.scrollIntoView();
    } else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!content) return;
    const item = location.pathname.startsWith('/projects/') ? content.projects.find((project) => location.pathname.endsWith(`/${project.slug}`))
      : location.pathname.startsWith('/blog/') ? content.posts.find((post) => location.pathname.endsWith(`/${post.slug}`)) : undefined;
    const label = item?.title || (location.pathname === '/projects' ? '项目' : location.pathname === '/blog' ? '博客' : '');
    document.title = label ? `${label} · ${content.settings.title}` : content.settings.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', item?.summary || content.settings.description);
  }, [content, location.pathname]);
  useEffect(() => {
    if (location.pathname !== '/') { setSection(''); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      const sections = ['about', 'skills', 'selected-projects', 'journal', 'contact'];
      const current = sections.filter((id) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 160).at(-1);
      setSection(current ?? '');
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); };
  }, [location.pathname, content]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); document.getElementById('menu-toggle')?.focus(); }
    };
    if (open) window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  if (!content) return null;
  return <div className="public-shell">
    {content.settings.starfieldEnabled && <Starfield paused={paused} />}
    <a className="skip-link" href="#main-content">跳到正文</a>
    <header className="site-header"><div className="container header-inner">
      <Link to="/" className="brand" aria-label={`${content.profile.name}，返回首页`}><span className="brand-mark">W.</span><span>{content.profile.name}<small>PERSONAL SPACE</small></span></Link>
      <button id="menu-toggle" className="menu-toggle" aria-expanded={open} aria-controls="public-nav" onClick={() => setOpen(!open)}>{open ? '关闭菜单' : '菜单'}<span aria-hidden="true">{open ? '×' : '☰'}</span></button>
      <nav id="public-nav" className={`public-nav ${open ? 'is-open' : ''}`} aria-label="前台导航" onClick={() => setOpen(false)}>
        <Link to="/" className={location.pathname === '/' && !section ? 'active' : ''} aria-current={location.pathname === '/' && !section ? 'page' : undefined}>首页</Link>
        <Link to="/#about" className={section === 'about' ? 'active' : ''} aria-current={section === 'about' ? 'location' : undefined}>关于我</Link>
        <Link to="/#skills" className={section === 'skills' ? 'active' : ''} aria-current={section === 'skills' ? 'location' : undefined}>技能</Link>
        <NavLink to="/projects" className={({ isActive }) => isActive || section === 'selected-projects' ? 'active' : ''}>项目</NavLink><NavLink to="/blog" className={({ isActive }) => isActive || section === 'journal' ? 'active' : ''}>博客</NavLink>
        <Link to="/#contact" className={`nav-contact ${section === 'contact' ? 'active' : ''}`} aria-current={section === 'contact' ? 'location' : undefined}>联系我 <Arrow diagonal /></Link>
      </nav>
    </div></header>
    <main id="main-content"><Outlet /></main>
    <footer className="site-footer container"><div><span className="brand-mark small">W.</span><span>{content.settings.footerText}</span></div>
      <div className="footer-tools">{content.settings.starfieldEnabled && <button className="motion-control" type="button" aria-pressed={paused || reduced} disabled={reduced} onClick={() => setPaused(!paused)}>{reduced ? '静态星空 · 跟随系统' : paused ? '开启星空动画' : '暂停星空动画'}</button>}<Link to="/admin">内容管理 <Arrow diagonal /></Link></div></footer>
    {content.settings.socialDisplayEnabled && content.profile.socialLinks.length > 0 && <nav className="container social-links" aria-label="社交链接">{content.profile.socialLinks.map((social) => safeContentUrl(social.url) && <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer">{social.label}<Arrow diagonal /></a>)}</nav>}
  </div>;
}
