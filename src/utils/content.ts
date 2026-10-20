export function safeContentUrl(value: string | undefined, kind: 'link' | 'image' = 'link'): string | undefined {
  if (!value) return undefined;
  const url = value.trim();
  if (!url || /[\u0000-\u0020\u007f\\]/.test(url) || url.startsWith('//')) return undefined;
  const protocol = /^([a-z][a-z\d+.-]*):/i.exec(url)?.[1].toLowerCase();
  if (protocol && !['http', 'https', ...(kind === 'link' ? ['mailto'] : [])].includes(protocol)) return undefined;
  if (kind === 'image' && url.startsWith('#')) return undefined;
  return url;
}

export function formatDate(value?: string, fallback = '日期待填写'): string {
  if (!value) return fallback;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[1]}年${Number(match[2])}月${Number(match[3])}日` : fallback;
}
