import { Link } from 'react-router';
import { usePortfolio } from '../../state/usePortfolio';
import { Arrow } from '../../components/common/Ui';
import { AboutSection } from '../../components/public/AboutSection';
import { SkillsSection } from '../../components/public/SkillsSection';
import { ContactSection } from '../../components/public/ContactSection';
import { ProjectCard, PostCard } from './ContentPages';
import { safeContentUrl } from '../../utils/content';

export function HomePage() {
  const { content } = usePortfolio();
  if (!content) return null;
  const { profile, skills } = content;
  const projects = [...content.projects].sort((a, b) => a.order - b.order);
  const posts = [...content.posts].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 3);
  const resume = safeContentUrl(profile.resumeUrl);
  return <>
    <section className="container hero">
      <div className="hero-copy"><div className="eyebrow"><span className="status-dot" /> SOFTWARE ENGINEERING / 软件工程</div>
        <p className="hero-intro">你好，我是</p><h1>{profile.name}<span className="title-period">.</span></h1>
        <h2>在代码与图像之间，<br /><span>持续探索。</span></h2>
        <p className="hero-description">{profile.tagline}</p>
        <div className="hero-actions"><Link className="button primary" to="/projects">查看我的项目 <Arrow /></Link><a className="button secondary" href="#about">认识我 <Arrow diagonal /></a>{resume && <a className="button secondary" href={resume} download>下载简历 <Arrow diagonal /></a>}</div>
        <div className="hero-meta"><span>{profile.studyStage}</span><i /><span>AI 辅助开发学习中</span></div>
      </div>
      <div className="research-art" aria-label="水下图像学习方向的抽象示意图">
        <div className="art-caption"><span className="status-dot" /> RESEARCH INTEREST<span>01 / EXPLORE</span></div>
        <svg className="orbit-art" viewBox="0 0 480 410" fill="none" role="img" aria-label="抽象的水波与观察轨道，非实验结果">
          <defs><radialGradient id="ocean"><stop stopColor="#1e777c" stopOpacity=".5" /><stop offset="1" stopColor="#102b3c" stopOpacity="0" /></radialGradient><linearGradient id="wave" x2="1" y2="1"><stop stopColor="#7de1d7" /><stop offset="1" stopColor="#467a9b" /></linearGradient></defs>
          <circle cx="240" cy="190" r="166" fill="url(#ocean)" />
          <g stroke="#26434c"><circle cx="240" cy="190" r="155" /><circle cx="240" cy="190" r="117" /><ellipse cx="240" cy="190" rx="204" ry="59" transform="rotate(-34 240 190)" /><path d="M30 190h420M240 20v340" strokeDasharray="3 7" /></g>
          <circle cx="240" cy="190" r="81" fill="#102830" stroke="#4c8989" />
          <g stroke="url(#wave)" strokeWidth="2.5"><path d="M181 174q30-27 59 0t59 0M181 191q30-27 59 0t59 0M181 208q30-27 59 0t59 0" /></g>
          <circle cx="367" cy="101" r="5" fill="#7de1d7" /><circle cx="117" cy="285" r="4" fill="#91a0cf" />
          <path d="M330 315h62M361 284v62" stroke="#527c87" /><circle cx="361" cy="315" r="22" stroke="#315663" />
          <g fill="#91aeb7"><circle cx="77" cy="77" r="1.5" /><circle cx="410" cy="239" r="1.5" /><circle cx="284" cy="49" r="1" /></g>
        </svg>
        <div className="art-bottom"><span className="eyebrow">UNDERWATER VISION</span><h3>让水下世界，<br />被更清晰地看见。</h3><p>水下图像增强 / 水下图像质量评估</p><span className="art-label">学习方向示意</span></div>
      </div>
    </section>
    <AboutSection profile={profile} />
    <SkillsSection skills={skills} />
    <section id="selected-projects" className="container section"><div className="section-heading"><div><span className="eyebrow">03 / SELECTED WORK</span><h2 className="section-title">让学习留下作品</h2></div><Link className="inline-link" to="/projects">查看项目 <Arrow /></Link></div><div className="project-grid home-project-grid">{projects.slice(0, 3).map((project) => <ProjectCard project={project} key={project.id} />)}</div>{!projects.length && <p>项目资料待补充。</p>}</section>
    <section id="journal" className="container section"><div className="section-heading"><div><span className="eyebrow">04 / JOURNAL</span><h2 className="section-title">把思考留在这里</h2></div><Link className="inline-link" to="/blog">查看笔记 <Arrow /></Link></div>{posts.length ? <div className="post-grid">{posts.map((post) => <PostCard post={post} key={post.id} />)}</div> : <div className="journal-empty"><span className="empty-symbol" aria-hidden="true">✧</span><div><h3>第一篇笔记，正在准备中。</h3><p>真实的学习记录将在这里慢慢积累，暂不填入虚构文章。</p></div><Link to="/blog" className="inline-link">前往博客 <Arrow /></Link></div>}</section>
    <ContactSection email={profile.email} />
  </>;
}
