import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { authApi } from '../api';
import { usePortfolio } from '../state/usePortfolio';

const links = [['/admin', '概览'], ['/admin/profile', '个人信息'], ['/admin/skills', '技能管理'],
  ['/admin/projects', '项目管理'], ['/admin/posts', '博客管理'], ['/admin/settings', '站点设置']];

export function AdminLayout() {
  const { refresh } = usePortfolio();
  const [error, setError] = useState('');
  async function logout() {
    try { await authApi.logout(); await refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : '退出失败。'); }
  }
  return <div className="admin-shell">
    <a className="skip-link" href="#admin-main">跳到管理内容</a>
    <aside className="admin-sidebar"><Link to="/admin" className="brand"><span className="brand-mark">W.</span><span>内容管理<small>PERSONAL STUDIO</small></span></Link>
      <p className="sidebar-label">工作空间</p><nav aria-label="后台导航">{links.map(([to, label], index) => <NavLink to={to} end={to === '/admin'} key={to}><span className="nav-number">0{index + 1}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><span className="status-dot" /> 教学演示 · 本地数据</div>
    </aside>
    <div className="admin-body"><header className="admin-topbar"><span>个人网站 / 内容管理</span><div><Link to="/">查看前台 ↗</Link><button className="text-button" onClick={() => void logout()}>退出登录</button></div></header>
      <main id="admin-main" className="admin-main">{error && <p role="alert" className="error-message">{error}</p>}<Outlet /></main>
    </div>
  </div>;
}
