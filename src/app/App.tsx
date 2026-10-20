import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { usePortfolio } from '../state/usePortfolio';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { HomePage } from '../pages/public/HomePage';
import { ProjectsPage, ProjectDetailPage, BlogPage, BlogDetailPage } from '../pages/public/ContentPages';
import { LoginPage } from '../pages/admin/LoginPage';
import { DashboardPage, ProfilePage, SkillsPage, ProjectsAdminPage, PostsAdminPage, SettingsPage } from '../pages/admin/AdminPages';
import { NotFoundPage } from '../components/common/Ui';

function ProtectedRoute() {
  const { session } = usePortfolio();
  const location = useLocation();
  return session ? <Outlet /> : <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
}
export function App() {
  const { ready, error, content, refresh } = usePortfolio();
  const location = useLocation();
  useEffect(() => {
    if (content) {
      document.documentElement.style.setProperty('--accent', content.settings.accentColor);
      if (location.pathname.startsWith('/admin')) document.title = `内容管理 · ${content.settings.title}`;
    }
  }, [content, location.pathname]);
  if (!ready) return <main className="app-status" role="status">正在准备个人空间…</main>;
  if (error) return <main className="app-status"><h1>暂时无法读取内容</h1><p role="alert">{error}</p><p>原有数据不会自动清空。</p><button className="button primary" onClick={() => void refresh()}>重新读取</button></main>;
  return <Routes>
    <Route element={<PublicLayout />}><Route index element={<HomePage />} /><Route path="projects" element={<ProjectsPage />} /><Route path="projects/:slug" element={<ProjectDetailPage />} /><Route path="blog" element={<BlogPage />} /><Route path="blog/:slug" element={<BlogDetailPage />} /><Route path="*" element={<NotFoundPage />} /></Route>
    <Route path="admin/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route path="admin" element={<AdminLayout />}><Route index element={<DashboardPage />} /><Route path="profile" element={<ProfilePage />} /><Route path="skills" element={<SkillsPage />} /><Route path="projects" element={<ProjectsAdminPage />} /><Route path="posts" element={<PostsAdminPage />} /><Route path="settings" element={<SettingsPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Route>
  </Routes>;
}
