import { useState } from 'react';
import type { Profile } from '../../types';
import { safeContentUrl, formatDate } from '../../utils/content';

export function AboutSection({ profile }: { profile: Profile }) {
  const [broken, setBroken] = useState<string>();
  const avatar = safeContentUrl(profile.avatarUrl, 'image');
  return <section id="about" className="container section about-section"><div><span className="eyebrow">01 / ABOUT ME</span><h2 className="section-title">保持好奇，<br />把想法变成实践。</h2>
    <div className="about-person">{avatar && avatar !== broken ? <img src={avatar} alt={`${profile.name}的头像`} onError={() => setBroken(avatar)} /> : <div className="avatar-placeholder" role="img" aria-label="姓名占位，真实头像待补充">{profile.name.slice(0, 1)}</div>}<div><strong>{profile.name}</strong><p>{avatar && avatar !== broken ? profile.major || '专业待填写' : '真实头像待补充'}</p></div></div>
  </div><div className="about-content"><p className="lead-text">{profile.bio || '个人简介待填写。'}</p><div data-testid="research-tags" className="mt-5 flex flex-wrap items-center gap-2">{profile.researchDirections.map((direction) => <span key={direction} className="rounded-full border border-[#31545e] bg-[#10222d] px-3 py-1 text-xs text-[#a7d9d2]">{direction}</span>)}</div>
    <div className="info-grid"><div><span>专业与阶段</span><strong>{[profile.major, profile.studyStage].filter(Boolean).join(' · ') || '待填写'}</strong></div><div><span>课余兴趣</span><strong>{profile.interests.join(' / ') || '待填写'}</strong></div></div>
    <div className="profile-timelines"><div><h3>教育背景</h3>{profile.education.length ? <ol className="timeline">{profile.education.map((item) => <li key={item.id}><strong>{item.school || '学校待填写'}</strong><p>{[item.major, item.degree].filter(Boolean).join(' / ') || '专业与学历待填写'}</p><span>{formatDate(item.startDate)} — {formatDate(item.endDate)}</span>{item.description && <p>{item.description}</p>}</li>)}</ol> : <p className="missing-content">学校与教育时间待填写。</p>}</div>
      <div><h3>经历时间线</h3>{profile.experiences.length ? <ol className="timeline">{profile.experiences.map((item) => <li key={item.id}><strong>{item.title}</strong>{item.organization && <p>{item.organization}</p>}<span>{formatDate(item.startDate)} — {formatDate(item.endDate)}</span><p>{item.description}</p></li>)}</ol> : <p className="missing-content">个人经历与对应时间待填写。</p>}</div></div>
  </div></section>;
}
