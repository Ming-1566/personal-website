import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { authApi, DEMO_CREDENTIALS } from '../../api';
import { usePortfolio } from '../../state/usePortfolio';
import { loginSchema } from '../../schemas';

export function LoginPage() {
  const { session, refresh } = usePortfolio();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const target: unknown = location.state?.from;
  const destination = typeof target === 'string' && /^\/admin(?:\/|$)/.test(target) && !target.startsWith('/admin/login') ? target : '/admin';
  if (session) return <Navigate to={destination} replace />;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const data = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({ username: data.get('username'), password: data.get('password') });
    if (!result.success) { setError(result.error.issues[0].message); return; }
    setBusy(true);
    try { await authApi.login(result.data); await refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : '暂时无法登录。'); }
    finally { setBusy(false); }
  }
  return <main className="login-shell"><section className="login-card"><Link to="/" className="back-link">← 返回个人网站</Link><span className="eyebrow">PERSONAL STUDIO</span><h1>进入内容工作台</h1><p>教学演示登录，仅用于本次课程实践。</p>
    <form onSubmit={(event) => void submit(event)} noValidate><label htmlFor="username">演示账号</label><input id="username" name="username" autoComplete="username" defaultValue={DEMO_CREDENTIALS.username} required />
      <label htmlFor="password">演示密码</label><input id="password" name="password" type="password" autoComplete="current-password" required aria-describedby="login-help" />
      {error && <p role="alert" className="error-message">{error}</p>}<button className="button primary" disabled={busy}>{busy ? '正在登录…' : '进入后台 →'}</button>
    </form><p id="login-help" className="demo-help">公开演示密码：<code>{DEMO_CREDENTIALS.password}</code></p><p className="muted-small">这是浏览器端模拟登录，不是真实服务端身份认证。请勿输入个人真实密码。</p>
  </section></main>;
}
