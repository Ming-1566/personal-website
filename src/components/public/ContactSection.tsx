import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { contactApi } from '../../api';
import { contactFormSchema } from '../../schemas';
import { Arrow } from '../common/Ui';

type Field = 'name' | 'email' | 'message';
export function ContactSection({ email }: { email: string }) {
  const [copyState, setCopyState] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [feedback, setFeedback] = useState({ message: '', failed: false });
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const emailRef = useRef<HTMLAnchorElement>(null);
  async function copyEmail() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('unavailable');
      await navigator.clipboard.writeText(email); setCopyState('邮箱已复制。');
    } catch {
      if (emailRef.current) {
        const range = document.createRange(); range.selectNodeContents(emailRef.current);
        window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range);
      }
      setCopyState('未能自动复制，邮箱已选中，请按 Ctrl+C 或长按复制。');
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = contactFormSchema.safeParse(Object.fromEntries(data.entries()));
    setFeedback({ message: '', failed: false });
    if (!result.success) {
      const fields: Partial<Record<Field, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as Field;
        if (['name', 'email', 'message'].includes(field) && !fields[field]) fields[field] = issue.message;
      });
      setErrors(fields);
      const firstField = Object.keys(fields)[0];
      const input = form.elements.namedItem(firstField);
      if (input instanceof HTMLElement) input.focus();
      return;
    }
    setErrors({}); submitting.current = true; setBusy(true);
    try {
      await contactApi.create(result.data);
      form.reset(); setFeedback({ message: '已保存到当前浏览器。本演示不会发送邮件，站点作者无法在其他设备看到这条留言。', failed: false });
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : '保存失败，请稍后重试。输入内容已保留。', failed: true });
    } finally { submitting.current = false; setBusy(false); }
  }
  return <section id="contact" className="container contact-section contact-complete">
    <div className="contact-intro"><span className="eyebrow">05 / GET IN TOUCH</span><h2>从一次交流开始。</h2><p>学习、项目与新的想法，欢迎通过邮箱联系。</p>
      <a ref={emailRef} href={`mailto:${email}`} className="contact-email">{email}<Arrow diagonal /></a>
      <button className="button secondary" type="button" onClick={() => void copyEmail()}>复制邮箱</button>
      <p className="copy-feedback" role="status">{copyState}</p>
      <div className="local-form-note"><span className="status-dot" /><p>留言表单用于课程本地保存演示。<br />如需联系本人，请使用上方邮箱发送邮件。</p></div>
    </div>
    <form className="contact-form" onSubmit={(event) => void submit(event)} noValidate aria-label="本地留言演示">
      <h3>留下一条本地记录</h3><p className="muted-small" id="contact-help">仅保存于你正在使用的浏览器，不会发送邮件。请勿填写敏感信息。</p>
      <div className="form-pair"><div><label htmlFor="contact-name">称呼 <span>必填</span></label><input id="contact-name" name="name" autoComplete="name" maxLength={100} required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'error-name' : undefined} />{errors.name && <p id="error-name" className="field-error">{errors.name}</p>}</div>
        <div><label htmlFor="contact-email">邮箱 <span>必填</span></label><input id="contact-email" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} aria-describedby={errors.email ? 'error-email' : undefined} />{errors.email && <p id="error-email" className="field-error">{errors.email}</p>}</div></div>
      <label htmlFor="contact-message">留言 <span>必填，最多2000字</span></label><textarea id="contact-message" name="message" rows={5} maxLength={2000} required aria-invalid={!!errors.message} aria-describedby={errors.message ? 'error-message' : 'contact-help'} />{errors.message && <p id="error-message" className="field-error">{errors.message}</p>}
      <button className="button primary" disabled={busy}>{busy ? '正在保存…' : '保存到当前浏览器'}<Arrow /></button>
      {feedback.message && <p className={feedback.failed ? 'form-feedback field-error' : 'form-feedback'} role={feedback.failed ? 'alert' : 'status'}>{feedback.message}</p>}
    </form>
  </section>;
}
