import { useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { z } from 'zod';
import { usePortfolio } from '../../state/usePortfolio';

export type FieldErrors = Record<string, string>;
export function Field({ label, name, value, onChange, errors = {}, type = 'text', hint }: {
  label: string; name: string; value?: string | number; onChange: (value: string) => void;
  errors?: FieldErrors; type?: string; hint?: string;
}) {
  const id = useId(); const error = errors[name];
  const props = { id, name, value: value ?? '', onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined };
  return <div className={`editor-field ${type === 'textarea' ? 'wide-field' : ''}`}><label htmlFor={id}>{label}</label>
    {type === 'textarea' ? <textarea {...props} rows={5} /> : <input {...props} type={type} />}
    {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}{error && <p id={`${id}-error`} className="field-error">{error}</p>}</div>;
}
export function TagsField({ label, name, value, onChange }: { label: string; name: string; value: string[]; onChange: (value: string[]) => void }) {
  const [text, setText] = useState(value.join('，'));
  return <Field label={label} name={name} value={text} onChange={(next) => { setText(next); onChange([...new Set(next.split(/[,，\n]/).map((part) => part.trim()).filter(Boolean))]); }} hint="多项用中文或英文逗号分隔" />;
}
export function useEditor<T>(initial: T, schema: z.ZodType<T>, persist: (value: T) => Promise<T>) {
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState(''); const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false); const lock = useRef(false);
  const { refresh } = usePortfolio();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (lock.current) return;
    setMessage(''); setFailed(false);
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      const next: FieldErrors = {};
      parsed.error.issues.forEach((issue) => { const name = issue.path.join('.'); next[name] ??= issue.message; });
      setErrors(next); setFailed(true); setMessage('请检查标红字段，修改尚未保存。');
      const field = event.currentTarget.elements.namedItem(Object.keys(next)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    lock.current = true; setBusy(true); setErrors({});
    try { const saved = await persist(parsed.data); setValue(saved); await refresh(); setMessage('已保存，前台已同步；刷新后仍保留。'); }
    catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : '保存失败，输入内容已保留。'); }
    finally { lock.current = false; setBusy(false); }
  }
  return { value, setValue, errors, message, failed, busy, submit };
}
export function SaveBar({ busy, message, failed, label = '保存修改', children }: { busy: boolean; message: string; failed: boolean; label?: string; children?: ReactNode }) {
  return <div className="save-bar"><div><button className="button primary" type="submit" disabled={busy}>{busy ? '正在保存…' : label}</button>{children}</div>
    {message && <p role={failed ? 'alert' : 'status'} className={failed ? 'field-error' : 'save-success'}>{message}</p>}</div>;
}
export const optional = (value: string) => value || undefined;
