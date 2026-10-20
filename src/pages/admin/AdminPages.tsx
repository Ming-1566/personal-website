import { useState } from 'react';
import { Link } from 'react-router';
import { profileApi, skillsApi, projectsApi, postsApi, settingsApi, backupApi } from '../../api';
import { profileSchema, skillSchema, projectSchema, postSchema, settingsSchema } from '../../schemas';
import type { Profile, Skill, Project, Post, SiteSettings } from '../../types';
import { usePortfolio } from '../../state/usePortfolio';
import { PageHeading } from '../../components/common/Ui';
import { Field, TagsField, SaveBar, useEditor, optional } from '../../components/admin/EditorUi';
import { MarkdownLoader } from '../../components/markdown/MarkdownLoader';
import '../../styles/admin.css';

export function DashboardPage() {
  const { managedContent: c } = usePortfolio();
  if (!c) return null;
  return <><PageHeading label="OVERVIEW / 工作台" title={`你好，${c.profile.name}。`}>在后台保存后，前台会读取同一份本地数据。</PageHeading>
    <div className="stat-grid">{[['技能', c.skills.length, 'skills'], ['项目', c.projects.length, 'projects'], ['博客', c.posts.length, 'posts']].map(([label, count, path]) => <Link className="stat-card" to={`/admin/${path}`} key={path}><span>{label}</span><strong>{count}</strong><span>管理 →</span></Link>)}</div>
    <section className="content-card"><h2>先编辑，再检查前台</h2><p>文章和项目可保存为草稿。只有已发布内容显示在前台；发布博客前需要填写真实日期。</p><Link to="/" className="inline-link">查看前台 ↗</Link></section>
    <p className="storage-note">教学演示：数据只保存在当前浏览器，不会自动同步到其他设备。可在站点设置中导出备份。演示登录不是真实的服务端身份认证。</p></>;
}

function ProfileEditor({ initial }: { initial: Profile }) {
  const e = useEditor(initial, profileSchema, profileApi.update); const p = e.value;
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => e.setValue({ ...p, [key]: value });
  const field = (key: 'name'|'tagline'|'bio'|'major'|'studyStage'|'email'|'avatarUrl'|'resumeUrl', label: string, type = 'text') => <Field key={key} label={label} name={key} value={p[key]} onChange={v => set(key, v)} errors={e.errors} type={type} />;
  return <form className="editor-panel" onSubmit={e.submit} noValidate><div className="editor-grid">
    {field('name','姓名')}{field('tagline','一句话介绍')}{field('major','专业')}{field('studyStage','学习阶段')}{field('email','联系邮箱','email')}{field('avatarUrl','头像地址（可留空）')}{field('resumeUrl','简历地址（可留空）')}{field('bio','个人简介','textarea')}
    <TagsField label="研究方向" name="researchDirections" value={p.researchDirections} onChange={v=>set('researchDirections',v)} /><TagsField label="兴趣爱好" name="interests" value={p.interests} onChange={v=>set('interests',v)} />
  </div>
  <h2>教育背景</h2>{p.education.map((row,i)=><fieldset key={row.id}><legend>教育背景 {i+1}</legend><div className="editor-grid">{(['school','major','degree','startDate','endDate','description'] as const).map((key,j)=><Field key={key} label={['学校','专业','学位','开始日期','结束日期','说明'][j]} name={`education.${i}.${key}`} value={row[key]} type={key.endsWith('Date')?'date':'text'} errors={e.errors} onChange={v=>set('education',p.education.map((r,n)=>n===i?{...r,[key]:optional(v)}:r))}/>)}</div><button type="button" className="text-button danger" onClick={()=>{if(confirm('确定删除这条教育背景？保存后生效。'))set('education',p.education.filter((_,n)=>n!==i));}}>删除教育背景</button></fieldset>)}
  <button type="button" className="button secondary" onClick={()=>set('education',[...p.education,{id:crypto.randomUUID()}])}>新增教育背景</button>
  <h2>经历</h2>{p.experiences.map((row,i)=><fieldset key={row.id}><legend>经历 {i+1}</legend><div className="editor-grid">{(['title','organization','startDate','endDate','description'] as const).map((key,j)=><Field key={key} label={['经历名称','组织','开始日期','结束日期','经历说明'][j]} name={`experiences.${i}.${key}`} value={row[key]} type={key.endsWith('Date')?'date':key==='description'?'textarea':'text'} errors={e.errors} onChange={v=>set('experiences',p.experiences.map((r,n)=>n===i?{...r,[key]:key.endsWith('Date')?optional(v):v}:r))}/>)}</div><button type="button" className="text-button danger" onClick={()=>{if(confirm('确定删除这条经历？保存后生效。'))set('experiences',p.experiences.filter((_,n)=>n!==i));}}>删除经历</button></fieldset>)}
  <button type="button" className="button secondary" onClick={()=>set('experiences',[...p.experiences,{id:crypto.randomUUID(),title:'',description:''}])}>新增经历</button>
  <h2>社交链接</h2>{p.socialLinks.map((row,i)=><fieldset key={row.id}><legend>社交链接 {i+1}</legend><div className="editor-grid"><Field label="平台名称" name={`socialLinks.${i}.label`} value={row.label} errors={e.errors} onChange={v=>set('socialLinks',p.socialLinks.map((r,n)=>n===i?{...r,label:v}:r))}/><Field label="完整 https 地址" name={`socialLinks.${i}.url`} value={row.url} errors={e.errors} onChange={v=>set('socialLinks',p.socialLinks.map((r,n)=>n===i?{...r,url:v}:r))}/></div><button type="button" className="text-button danger" onClick={()=>{if(confirm('确定删除此链接？保存后生效。'))set('socialLinks',p.socialLinks.filter((_,n)=>n!==i));}}>删除链接</button></fieldset>)}
  <button type="button" className="button secondary" onClick={()=>set('socialLinks',[...p.socialLinks,{id:crypto.randomUUID(),label:'',url:''}])}>新增社交链接</button><SaveBar {...e}/></form>;
}
export function ProfilePage(){const {managedContent:c}=usePortfolio();return <><PageHeading label="PROFILE / 个人信息" title="真实地介绍自己">未知资料可留空，不要编造经历。新增行需要填写后保存。</PageHeading>{c&&<ProfileEditor initial={c.profile}/>}</>;}

function SkillEditor({initial,isNew,onClose}:{initial:Skill;isNew:boolean;onClose:()=>void}){
  const e=useEditor(initial,skillSchema,v=>isNew?skillsApi.create(v):skillsApi.update(v.id,v));
  return <form className="editor-panel" onSubmit={e.submit} noValidate><h2>{isNew?'新增技能':'编辑技能'}</h2><div className="editor-grid">{(['name','category','proficiencyLabel','order'] as const).map((key,i)=><Field key={key} label={['技能名称','分类','熟练度（真实填写，可留空）','排序（从0开始）'][i]} name={key} value={e.value[key]} type={key==='order'?'number':'text'} errors={e.errors} onChange={v=>e.setValue({...e.value,[key]:key==='order'?Number(v):v})}/>)}</div><SaveBar {...e}><button type="button" className="button secondary" onClick={onClose}>返回列表</button></SaveBar></form>;
}
export function SkillsPage(){
  const {managedContent:c,refresh}=usePortfolio();const [editing,setEditing]=useState<Skill|null>(null);const [isNew,setNew]=useState(false);const [error,setError]=useState('');
  async function remove(s:Skill){if(!confirm(`确定删除技能“${s.name}”？`))return;try{await skillsApi.remove(s.id,true);await refresh();}catch(e){setError(String(e));}}
  return <><PageHeading label="SKILLS / 技能管理" title="积累自己的工具箱">新增、编辑并保存技能；熟练度没有依据时留空。</PageHeading>{error&&<p role="alert">{error}</p>}{editing?<SkillEditor key={editing.id} initial={editing} isNew={isNew&&!c?.skills.some(s=>s.id===editing.id)} onClose={()=>setEditing(null)}/>:<><button className="button primary" onClick={()=>{setNew(true);setEditing({id:crypto.randomUUID(),name:'',category:'',order:c?.skills.length??0});}}>新增技能</button><div className="content-grid admin-list">{c?.skills.map(s=><article className="content-card" key={s.id}><span>{s.category}</span><h2>{s.name}</h2><p>{s.proficiencyLabel||'熟练度待填写'}</p><div className="editor-actions"><button onClick={()=>{setNew(false);setEditing(s);}}>编辑</button><button className="danger" onClick={()=>void remove(s)}>删除</button></div></article>)}</div></>}</>;
}

type Entry=Project|Post;
function EntryEditor({initial,kind,isNew,onClose}:{initial:Entry;kind:'projects'|'posts';isNew:boolean;onClose:()=>void}){
  const persist=async(v:Entry)=>{const updated={...v,updatedAt:new Date().toISOString()};if(kind==='projects'){const p=projectSchema.parse(updated);return isNew?projectsApi.create(p):projectsApi.update(p.id,p);}const p=postSchema.parse({...updated,source:'local'});return isNew?postsApi.create(p):postsApi.update(p.id,p);};
  const e=useEditor<Entry>(initial,kind==='projects'?projectSchema:postSchema,persist);const p=e.value;
  const field=(key:string,label:string,type='text')=><Field key={key} label={label} name={key} value={(p as unknown as Record<string,string|number>)[key]} errors={e.errors} type={type} onChange={v=>e.setValue({...p,[key]:key==='order'?Number(v):key==='date'?optional(v):v})}/>;
  return <form className="editor-panel" onSubmit={e.submit} noValidate><h2>{isNew?'新增':'编辑'}{kind==='projects'?'项目':'博客'}</h2><div className="editor-grid">{field('title','标题')}{field('slug','链接名称（小写英文、数字、连字符）')}{field('summary','摘要','textarea')}{field('date','日期（发布博客必填）','date')}{field('coverUrl','封面地址（可留空）')}<TagsField label="标签" name="tags" value={p.tags} onChange={v=>e.setValue({...p,tags:v})}/><div className="editor-field"><label htmlFor="entry-status">发布状态</label><select id="entry-status" name="status" value={p.status} onChange={v=>e.setValue({...p,status:v.target.value as 'draft'|'published'})}><option value="draft">草稿：前台不可见</option><option value="published">已发布：前台可见</option></select></div>
    {kind==='projects'&&<>{field('deliveryStatus','完成情况')}{field('achievement','真实成果')}{field('role','承担角色')}{field('dateLabel','时间说明（可留空）')}{field('demoUrl','演示地址（可留空）')}{field('repoUrl','仓库地址（可留空）')}{field('order','排序','number')}</>}</div>
    <div className="markdown-editor"><div>{field('bodyMarkdown','Markdown 正文','textarea')}</div><section className="markdown-preview" aria-label="Markdown实时预览"><h2>实时预览（尚未保存）</h2>{p.bodyMarkdown?<MarkdownLoader markdown={p.bodyMarkdown} tocLabel="预览目录"/>:<p>输入 Markdown 后在这里预览。原始 HTML 不会执行。</p>}</section></div><SaveBar {...e}><button className="button secondary" type="button" onClick={onClose}>返回列表</button></SaveBar></form>;
}
function EntryManager({kind}:{kind:'projects'|'posts'}){
  const {managedContent:c,refresh}=usePortfolio();const [editing,setEditing]=useState<Entry|null>(null);const [isNew,setNew]=useState(false);const [error,setError]=useState('');const items=c?.[kind]??[];
  function add(){const base={id:crypto.randomUUID(),slug:'',title:'',summary:'',bodyMarkdown:'',tags:[],status:'draft' as const,updatedAt:new Date().toISOString()};setNew(true);setEditing(kind==='projects'?{...base,order:items.length}:{...base,source:'local'});}
  async function remove(p:Entry){if(!confirm(`确定删除“${p.title}”？此操作将影响前台。`))return;try{if(kind==='projects')await projectsApi.remove(p.id,true);else await postsApi.remove(p.id,true);await refresh();}catch(e){setError(String(e));}}
  return <><PageHeading label={kind==='projects'?'PROJECTS / 项目管理':'POSTS / 博客管理'} title={kind==='projects'?'整理实践的成果':'留下一些学习笔记'}>保存后前台同步，草稿不对外展示。请只填写真实内容。</PageHeading>{error&&<p role="alert">{error}</p>}{editing?<EntryEditor key={editing.id} initial={editing} kind={kind} isNew={isNew&&!items.some(p=>p.id===editing.id)} onClose={()=>setEditing(null)}/>:<><button className="button primary" onClick={add}>{kind==='projects'?'新增项目':'新增博客'}</button>{!items.length&&<p className="storage-note">暂无内容，尚未提供的文章不作虚构填充。</p>}<div className="content-grid admin-list">{items.map(p=><article className="content-card" key={p.id}><span>{p.status==='draft'?'草稿':'已发布'}</span><h2>{p.title}</h2><p>{p.summary}</p><div className="editor-actions"><button onClick={()=>{setNew(false);setEditing(p);}}>编辑</button><button className="danger" onClick={()=>void remove(p)}>删除</button>{p.status==='published'&&<Link to={`/${kind==='posts'?'blog':'projects'}/${p.slug}`}>查看前台 ↗</Link>}</div></article>)}</div></>}</>;
}
export function ProjectsAdminPage(){return <EntryManager kind="projects"/>;}
export function PostsAdminPage(){return <EntryManager kind="posts"/>;}

function SettingsEditor({initial}:{initial:SiteSettings}){
 const e=useEditor(initial,settingsSchema,settingsApi.update);
 return <form className="editor-panel" onSubmit={e.submit} noValidate><div className="editor-grid">{(['title','description','accentColor','footerText'] as const).map((key,i)=><Field key={key} label={['站点标题','站点介绍','强调色（如 #6ee7d0）','页脚文字'][i]} name={key} value={e.value[key]} errors={e.errors} type={key==='description'?'textarea':'text'} onChange={v=>e.setValue({...e.value,[key]:v})}/>)}</div>{(['starfieldEnabled','socialDisplayEnabled'] as const).map((key,i)=><label className="editor-checkbox" key={key}><input type="checkbox" checked={e.value[key]} onChange={v=>e.setValue({...e.value,[key]:v.target.checked})}/>{['启用星空动画（仍尊重系统减少动态效果设置）','展示社交链接'][i]}</label>)}<SaveBar {...e}/></form>;
}
export function SettingsPage(){
 const {managedContent:c,refresh}=usePortfolio();const [message,setMessage]=useState('');const [failed,setFailed]=useState(false);const [importVersion,setImportVersion]=useState(0);
 async function exportBackup(){try{const data=await backupApi.exportContent();const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='portfolio-content.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setFailed(false);setMessage('内容备份已导出，不包含登录信息和本地留言。');}catch(e){setFailed(true);setMessage(String(e));}}
 async function importBackup(file?:File){if(!file)return;try{const data=await backupApi.validateImport(JSON.parse(await file.text()));if(!confirm('导入将覆盖当前个人信息、技能、项目、博客和设置。确定继续？'))return;await backupApi.importContent(data,true);await refresh();setFailed(false);setImportVersion(v=>v+1);setMessage('导入成功，前台已同步。');}catch(e){setFailed(true);setMessage(`导入失败，原数据保留。${String(e)}`);}}
 return <><PageHeading label="SETTINGS / 站点设置" title="网站的基本信息">设置保存后立即生效。跨设备前请先导出内容备份。</PageHeading>{c&&<SettingsEditor key={importVersion} initial={c.settings}/>}<section className="editor-panel"><h2>内容备份</h2><p>本地数据不会随网站部署上传，也不会同步给其他访客。备份文件请妥善保管。</p><button className="button secondary" onClick={()=>void exportBackup()}>导出内容备份</button><div className="editor-field"><label htmlFor="backup-file">导入内容备份（JSON）</label><input id="backup-file" type="file" accept=".json,application/json" onChange={event=>{void importBackup(event.target.files?.[0]);event.target.value='';}}/></div>{message&&<p role={failed?'alert':'status'}>{message}</p>}</section></>;
}

