import type { Skill } from '../../types';

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const groups = new Map<string, Skill[]>();
  [...skills].sort((a, b) => a.order - b.order).forEach((skill) => groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill]));
  return <section id="skills" className="container section"><div className="section-heading"><div><span className="eyebrow">02 / TOOLKIT</span><h2 className="section-title">学习与使用的语言</h2></div><p>持续积累，在实践中理解。</p></div>
    {groups.size ? [...groups].map(([category, items]) => <div className="skill-group" key={category}><h3 className="skill-category">{category}</h3><div className="skill-grid">{items.map((skill) => <article className="skill-card" key={skill.id}><span className="skill-glyph" aria-hidden="true">{skill.name.slice(0, 2)}</span><h4>{skill.name}</h4><p>{skill.category}</p><span className="muted-small">熟练度{skill.proficiencyLabel ? `：${skill.proficiencyLabel}` : '待填写'}</span></article>)}</div></div>) : <p>技能信息待填写。</p>}
  </section>;
}
