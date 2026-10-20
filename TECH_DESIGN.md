# 王昱涵个人展示网站 · 技术设计文档

> 版本：1.3 | 日期：2026-10-20 | 状态：前后台本地编辑功能已完成，正式部署待进行。未推送或部署。
> 本文回答“怎么实现”。功能与验收依据 PRD.md，开发行为依据 AGENTS.md。

## 1. 设计来源与边界

【课程】【用户】固定技术路线：React + TypeScript + Vite + Tailwind CSS；前后台共享类型，src/api/ 统一接口，localStorage 模拟；zod 表单校验，演示 token 登录，后台独立布局，Markdown 编辑预览；最终 Vercel 部署。

参考课件：D:/QQ recieve/项目开发流程.pdf 第7—10页；D:/QQ recieve/7.部署.pdf 第4—6页。个人内容来源：D:/资料/企业实习/个人介绍.txt。

本文的文件布局、模型字段、存储键、合并策略、会话时效及具体工具选择均为【实施建议】，用于落实课程要求；不是课件逐字规定。已安装版本与当前范围见 package.json、package-lock.json 和 README.md；后台编辑与内容备份已实现；公网发布仍为后续阶段。

## 2. 系统结构与技术选型

逻辑关系：前台页面 / 后台页面 → 共享状态与 src/api/ → 默认内容 + 浏览器 localStorage。
源码 Markdown 文件 → Vite 构建读取 → 默认博客内容 → 同一 src/api/。
Vercel 只托管本期构建产物，不提供本项目尚未实现的数据库或真实认证。

| 层次 | 方案 | 来源 / 说明 |
| --- | --- | --- |
| UI 与类型 | React、TypeScript | 【课程】【用户】组件化、类型一致 |
| 开发构建 | Vite | 【课程】【用户】开发服务与静态构建 |
| 样式 | Tailwind CSS + 必要的局部 CSS | 【课程】【用户】按实际版本配置，不混用旧版教程 |
| 路由 | React Router 的浏览器路径路由 | 【实施建议】保持课件 /admin/... 路径 |
| 校验 | zod | 【课程】【用户】表单、导入数据和存储边界复用 schema |
| 表单 | 受控表单；必要时 react-hook-form | 【实施建议】简单表单不用增加不必要依赖 |
| Markdown 渲染 | react-markdown、GFM 支持与轻量代码高亮插件 | 【实施建议】禁用原始 HTML；预览和详情共用渲染组件 |
| Markdown 元信息 | YAML frontmatter + 明确字段校验 | 【实施建议】使用适合浏览器构建的解析库；不依赖 Node 专属接口 |
| 状态通知 | React Context / 订阅式轻量 store | 【实施建议】让同标签前后台即时更新，不引入重型全局状态库 |
| 星空 | Canvas 2D、requestAnimationFrame | 【课程】闪烁、视差、移动端降粒子 |
| 后端与数据库 | 本期无真实后端、无云数据库；src/api/ 返回 Promise 的本地适配实现 | 【课程】模拟接口，便于后续替换 |
| 发布 | GitHub 源码 → Vercel Vite 构建 → dist | 【课程】【用户】实际推送与发布不在本阶段执行 |

不引入大型 UI 组件库、浏览器插件专用构建工具、电商抓图代码或无关交易记录功能。

## 3. 计划目录

以下是完整目标的目录计划。统一接口暂集中在 src/api/client.ts 并由 src/api/index.ts 导出明确的接口名，后续按复杂度拆分文件。前台阶段已增加 components/public、components/markdown、utils；后台共用表单位于 components/admin，备份通过统一 API 实现。

```text
personal-website/
  PRD.md
  TECH_DESIGN.md
  AGENTS.md
  README.md                    # 启动、演示登录、数据边界与部署说明
  package.json
  package-lock.json
  .gitignore
  index.html
  vite.config.ts
  tsconfig*.json
  vercel.json                  # SPA 回退配置
  public/
    assets/                    # 自有头像、封面等；缺失时用明确占位
    resume/                    # 只在提供真实简历后使用
  src/
    main.tsx
    app/                       # 路由、Provider、受保护路由
    types/                     # Profile/Skill/Project/Post/Settings 等
    schemas/                   # zod 表单和持久化 schema
    api/
      index.ts                 # 统一对外接口
      profile.ts
      skills.ts
      projects.ts
      posts.ts
      settings.ts
      auth.ts
      contact.ts
      backup.ts
      storage/                 # 版本、持久化、错误映射与适配
    data/
      defaults.ts              # 仅含允许公开的默认个人内容
      content-loader.ts        # Markdown 文件发现、校验、索引
    content/posts/             # 源码文章 .md
    state/                     # 应用状态订阅与更新通知
    components/
      common/                  # 字段、对话框、状态、确认框
      public/                  # 导航、页脚、星空、卡片
      admin/                   # 侧栏、管理工具栏、编辑器
      markdown/                # 安全渲染、目录与代码高亮
    layouts/                   # PublicLayout、AdminLayout
    pages/
      public/                  # 首页、项目列表/详情、博客列表/详情、404
      admin/                   # 登录、仪表盘、个人、技能、项目、博客、设置
    styles/
    utils/                     # slug、日期、URL、安全辅助函数
  tests/                       # 关键数据行为与业务操作测试，按需建立
```

禁止将原始个人介绍.txt 或含学号的完整资料复制到 public/ 或可导出的默认内容中。学校、头像、简历、项目技术栈、链接和日期缺失时保持待填写，不伪造。

## 4. 路由与权限边界

| 路由 | 页面 | 访问约定 |
| --- | --- | --- |
| / | 首页与个人介绍、技能、联系锚点 | 公开 |
| /projects | 项目列表 | 公开，只展示已发布内容 |
| /projects/:slug | 项目详情 | 公开；缺失/未发布提示不可访问 |
| /blog | 博客列表 | 公开，只展示已发布内容 |
| /blog/:slug | 博客详情 | 公开；缺失/未发布提示不可访问 |
| /admin/login | 演示登录 | 未登录可用，登录后进入仪表盘 |
| /admin | 仪表盘 | 演示会话检查 |
| /admin/profile | 个人信息管理 | 演示会话检查 |
| /admin/skills | 技能管理 | 演示会话检查 |
| /admin/projects | 项目管理 | 演示会话检查 |
| /admin/posts | 博客管理 | 演示会话检查 |
| /admin/settings | 站点设置 | 演示会话检查 |
| 其他路径 | 404 | 提供返回首页或对应列表入口 |

【实施建议】项目和博客编辑器可在其管理页内使用，不强制增加编辑 URL。未登录跳转可保留站内目标路径，但必须验证为本站 /admin 路径，避免开放重定向。

前台 Navbar 不用于后台。访客直接输入深层路径时由 Vercel 回退到 index.html，再由前端路由决定展示或拦截。

## 5. 数据模型

字段由 src/schemas/index.ts 的 zod schema 定义，src/types/index.ts 推导 TypeScript 类型。以下模型为完整设计，其中备份类型已预留 schema，接口和界面尚未实现。时间采用 ISO 8601 字符串；标签去重；id 稳定；slug 在各自实体集合内唯一。

| 模型 | 字段与含义 |
| --- | --- |
| Profile | name、tagline、bio、avatarUrl?、major?、studyStage?、researchDirections[]、interests[]、education[]、experiences[]、email、socialLinks[]、resumeUrl? |
| Education | id、school?、major?、degree?、startDate?、endDate?、description? |
| Experience | id、title、organization?、startDate?、endDate?、description |
| SocialLink | id、label、url |
| Skill | id、name、category、proficiencyLabel?、iconKey?、order |
| Project | id、slug、title、summary、bodyMarkdown、tags[]、coverUrl?、date?、dateLabel?、status（draft/published）、deliveryStatus?、achievement?、role?、demoUrl?、repoUrl?、order、updatedAt |
| Post | id、slug、title、summary、bodyMarkdown、tags[]、coverUrl?、date?、status（draft/published）、updatedAt、source（file/local） |
| SiteSettings | title、description、accentColor、footerText、starfieldEnabled、socialDisplayEnabled |
| DemoSession | token、username、issuedAt、expiresAt；无密码字段 |
| ContactMessage | id、name、email、message、createdAt；仅当前浏览器，独立存储，不导入公开内容 |
| ContentState | schemaVersion、revision、profileOverride?、settingsOverride?、skills/projects/posts 的 overrides 与 deletedIds |
| ContentBackup | schemaVersion、exportedAt、resolvedContent（Profile、Skill[]、Project[]、Post[]、SiteSettings）；不含会话或联系留言 |

【实施建议】缺失资料在编辑表单显示“待填写”提示，数据中用缺省或空值表达，不给 date 等字段写入非法的“待填写”字符串。项目未知日期允许为空，前台显示待填写；正式发布文章要求有效发布日期，未填写时先存草稿。

默认资料映射：姓名王昱涵；软件工程大四在读；水下图像增强与水下图像质量评估；乒乓球；C、Java、Python、Matlab；景区智能导览系统及用户提供的获奖说明；3344362245@qq.com。学生编号不进入 Profile。详情只填写已知事实，职责、技术标签与真实链接不从个人技能反推。

## 6. 统一接口层约定

页面、组件不直接访问 localStorage；只使用 src/api/ 和共享数据状态。接口以 Promise 返回结果，后续可换为 HTTP 实现。

| 接口组 | 计划操作 |
| --- | --- |
| profileApi | get、update（含教育、经历、社交条目） |
| skillsApi | list、create、update、remove |
| projectsApi | list、getBySlug、getById、create、update、remove |
| postsApi | list、getBySlug、getById、create、update、remove |
| settingsApi | get、update |
| authApi | login、getSession、logout |
| contactApi | create；本期明确为本地记录 |
| backupApi | exportContent、validateImport、importContent |

查询通过 visibility 区分 published 与管理视图；管理查询与写入检查演示会话，但该检查不提供真实安全保证。公共查询返回统一类型而不泄露会话或留言。

写入顺序：校验 → 获取最新本地状态 → 计算合并与变更 → 持久化 → 发布变更通知 → 页面更新 → 显示成功。写入失败时不得提前提示保存成功或假装刷新后仍能保留。

标准错误类别：VALIDATION、NOT_FOUND、DUPLICATE_SLUG、DEMO_UNAUTHENTICATED、STORAGE_UNAVAILABLE、QUOTA_EXCEEDED、CORRUPT_DATA、UNSUPPORTED_VERSION。返回可理解的中文消息与字段错误，不要求用户阅读原始异常堆栈。

## 7. 存储、默认内容与合并

### 7.1 键与来源

【实施建议】localStorage 使用命名空间：
- wyh-portfolio:content:v1：内容覆盖、删除标记、结构版本和修订号。
- wyh-portfolio:session:v1：演示 token 与会话时间。
- wyh-portfolio:contact:v1：当前浏览器联系表单记录。

默认公开内容来自源码，用户修改来自 localStorage；两者合并后由接口返回，禁止页面分别维护互不一致的副本。

### 7.2 覆盖与删除规则

对于 skills、projects、posts：
1. 从源码默认集合读取稳定 id，先移除 deletedIds 中的条目。
2. 同 id 的本地 override 覆盖默认条目；本地新建条目加入集合。
3. 再执行状态过滤、排序和查询；源码新加入且未被删除的稳定 id 自动出现。
4. 编辑文件文章生成同 id override，不再追加第二篇。
5. 删除默认/文件条目写入 deletedIds，同时移除相应 override；删除本地新建条目移除 override。
6. 页面刷新、重新读取数据或新增其他文章时，不重新填回被删除的记录。

Profile 和 SiteSettings 采用有校验的字段覆盖。第一次读取没有本地修改时直接用源码默认值；不得在每次加载时用 defaults 覆写已有编辑。

### 7.3 Markdown 文件约定

src/content/posts/*.md 包含 YAML frontmatter：id、slug、title、summary、date、tags、status，可选 coverUrl。正文为 Markdown。id 不随文件名或标题改变；slug 冲突视为错误。

【实施建议】使用 Vite import.meta.glob 的 raw 导入建立文章集合。开发服务重新发现文件；正式站点通过重新构建发布反映新增源码文章。无效元信息在开发时报清楚文件位置，正式构建不悄悄发布坏文章。

文件内容与本地编辑同时存在时采用第7.2节规则。修改源码文件不会自动清除已有本地覆盖；用户可在确认后恢复该条目的源码版本。后台不会假装把浏览器编辑写回仓库中的 .md。

### 7.4 一致性、异常与迁移

- 同标签写入后通知共享 store；其他标签监听 storage 事件后重新读取。storage 事件本身不通知发起写入的标签。
- 本地集合更新前重新读取状态；本期说明为单维护者演示，同条目冲突采用后写入覆盖，不宣称多用户并发能力。
- JSON 损坏、版本未知时保留原值并提示，提供可确认的备份/恢复操作，不静默重置。
- Schema 升级编写迁移说明；导入先完整校验，再确认替换。本地存储失败保持旧内容与表单输入。
- 导出为已解析的内容快照；导入转成等价 overrides/deletedIds，确保替换后的集合与备份一致。导入改变稳定 id 或 slug 时仍须校验唯一性。
- 不在公开数据导出中混入 token、密码、联系留言、学号或其他项目内容。

## 8. 演示认证与输入安全

【课程】【用户】用户名/密码在登录表单输入；只保存随机演示 token 和必要会话元数据，不记录密码，也不把它写入日志。

【实施建议】凭据采用独立的公开教学配置，明确不是秘密，不使用个人真实账号密码。token 可用 crypto.randomUUID 生成；建议有效期8小时，过期或格式无效时按未登录处理，退出后清除。

随机 token、前端密码校验、密码摘要或路由守卫均不能成为真实服务端授权。客户端代码可被查看或修改，不能把前端存储当成数据库安全方案。生产升级需要服务端认证、授权和数据库，另行设计。

表单、导入、存储读取共用 zod schema。校验必须包括必填、长度、有效日期、合法 URL、同集合 slug 唯一和邮箱；技能不强制用户编造熟练度。演示中建议留言最大2000字、摘要最大300字等边界，具体数值在实现时统一记录。

Markdown 渲染默认不执行 HTML，过滤 javascript 等危险协议，不直接用不可信字符串设置 innerHTML；外链使用恰当的 rel。对外资源仅接受明确的 http/https、站内路径及对应位置允许的 mailto 链接，不能误拒绝合法锚点。

所有删除、批量覆盖导入、恢复默认数据必须确认。头像和封面优先自有相对路径或有效 HTTPS URL，本期不声称实现了图片上传服务器。

## 9. 交互、星空与无障碍

- 主题使用 CSS 变量，Tailwind 布局与必要的普通 CSS 配合；强调色改变后仍检查对比度。
- 星空独立组件：单一动画循环、卸载清理、resize 适配、限制设备像素比、移动端降粒子，页面隐藏时暂停。
- 开启 prefers-reduced-motion 时停用持续闪烁/视差及不必要入场动效，保留静态背景；视觉效果不能阻挡点击或阅读。
- 菜单维护 aria-expanded、展开内容关联与焦点状态；点击链接或 Escape 可关闭。弹窗可用键盘操作，关闭后恢复合理焦点。
- 375px 为课程必测宽度，补测320px；后台长标题、URL、代码块不能撑开整页，必要时仅局部滚动。
- Markdown 标题生成稳定锚点并处理同名标题；目录只索引真实标题，预览与详情采用相同安全策略。
- 文章时间使用确定的解析和展示规则，避免浏览器与时区差异导致日期偏移。
- 星空 ≥50fps 为课程目标，不是当前实测结果；至少记录真实移动设备/浏览器、视口、动效模式与10秒采样，不以桌面模拟冒充实机结果。

## 10. Vercel 部署设计

【课程】【用户】后续完成源码上传 GitHub 后，Vercel 导入仓库。基础阶段只创建本地 Vercel 配置供后续使用，不初始化 Git、不提交、不推送、不发布。

| 配置 | 计划值 |
| --- | --- |
| 项目根目录 | personal-website 项目中直接包含 package.json 的目录；独立仓库根部署时为默认根目录 |
| 框架预设 | Vite |
| 安装 | 按锁文件；锁文件存在并一致时 npm ci |
| 构建 | npm run build；脚本须包含 TypeScript 检查与 Vite 构建 |
| 输出目录 | dist |
| 开发预览 | npm run dev；以终端实际地址为准 |
| 构建预览 | npm run preview；以终端实际地址为准 |
| 部署地址 | 后续由 Vercel 实际分配，目前待部署 |

【实施建议】项目根目录 vercel.json 已配置 SPA 回退规则：source 为 /(.*)，destination 为 /index.html。已验证本地 Vite 服务和构建预览中的资源与路由；真正 Vercel 环境的验证留到部署阶段，不能用本地刷新通过替代公网验收。

必须检查 /projects/:slug、/blog/:slug、/admin/profile 的直接访问与刷新；框架识别成功不代表这些路由已通过验证。本项目不复用上次 GitHub Pages /docs 路线，也不沿用其仓库子路径 base。

Node 版本在开发时选择与所装 Vite、依赖及 Vercel 支持范围匹配的版本，提交锁文件并在 README 记录。部署前运行类型检查、构建与正式产物预览；不要直接双击 index.html 验收 Vite 项目。

部署前的数据准备：将用户确认的公开资料作为源码默认内容提交；若仅在 localhost 改过 localStorage，必须提醒这部分不会随部署自动出现。公网后台编辑也只影响当前浏览器；要让所有访客看到新内容，需要更新源码默认内容再部署，或后续引入真实后端。

不提交 node_modules、dist、真实凭据、原始个人资料和含学号的素材；不上传整个父目录。独立仓库首页应直接能看到 package.json、src 和三个文档。

## 11. 验证策略与后续演进

【课程】先可运行，再核心功能，再细节。实际测试以 PRD AC01—AC26 为依据。

优先自动验证：数据合并与删除标记、重复 slug、存储失败不报成功、会话退出/过期、后台修改到前台持久化、Markdown 文件发现与本地覆盖；这些能避免真实数据和操作错误，不为纯文档或装饰变化编写测试。

人工验证：资料真实性、深色阅读、键盘、375px布局、真实设备星空帧率、正式域名路由、后台编辑与截图证据。未执行的检查标“待验证”；不得把设计目标写成通过结果。

后续升级时保持 api 对外契约，换成真实 HTTP 后端、服务端会话与云存储；替换时重新设计鉴权、共享数据与部署，不把本期 localStorage token 原样当成生产方案。

## 12. 前台阶段的实际实现

- AboutSection、SkillsSection 和 ContentCover 展示统一模型；缺失头像、封面、学校、日期、熟练度与链接保持明确占位，无编造资料。
- 项目列表支持搜索，博客支持搜索与标签过滤；详情采用按需加载的共享 MarkdownContent，主站不一次性加载高亮与全部排版工具。MarkdownLoader 提供加载状态和失败刷新入口。
- Markdown 使用 react-markdown + remark-gfm + rehype-highlight，skipHtml 丢弃原始 HTML，白名单式 URL 策略拒绝危险协议、控制字符和协议相对 URL。图片失败显示说明，外链有 rel 属性，代码与表格仅局部滚动。
- 目录和正文共用同一 Markdown AST 标题规则及 github-slugger；id 带 md- 前缀，重复标题唯一，代码围栏中的井号不产生目录。深层 URL 的目录锚点等内容加载后再定位，避免首载找不到元素。
- Starfield 使用单一 requestAnimationFrame 循环；桌面76、平板48、手机28粒子，像素比上限1.75。页面隐藏暂停、组件卸载清理；系统减少动态效果时只画静态背景；页脚可手动暂停/恢复。帧率需另做真实手机测量，不能由上述参数推断通过。
- ContactSection 使用共享 contactFormSchema 与 contactApi；字段错误有标签关联，保存失败保留输入，成功如实标明本地保存且不会发送邮件。复制邮箱失败时选中邮箱并提示手动复制，不虚报成功。
- 公共导航包含技能入口、移动菜单与当前栏目高亮；路由标题、摘要与详情内容匹配。用户自行运行的5173服务保留，工具测试4173服务在验证结束后清理。
- 验证文章只存在于 tests 中的固定内容和临时测试浏览器，不向 src/content/posts 或默认公开数据加入虚构文章。

技术依据：[react-markdown 的安全与扩展说明](https://github.com/remarkjs/react-markdown)、[rehype-highlight](https://github.com/rehypejs/rehype-highlight)、[MDN 减少动态效果](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)、[MDN 页面可见性](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)。

## 13. 后台编辑的实际实现

【实施建议】AdminPages 复用 components/admin/EditorUi 的标签、字段错误、保存状态与提交锁。个人信息支持教育、经历和社交链接增删，集合支持新增、修改和确认删除。所有修改通过现有 API 完成，不直接访问 localStorage。

项目与博客正文采用共享安全 MarkdownLoader 实时预览；新记录默认草稿，发布博客必须填写日期。保存前 zod 校验，保存失败保留输入。保存后刷新共享状态，前台读取同源数据。未知资料不自动生成。

backupApi 导出完整合并内容，不包含会话与留言；导入先校验格式、ID 和 slug 唯一性，再确认覆盖，通过一次存储提交完成。原始默认记录未出现在备份中时记录删除标记，避免删除后默认内容复活。

实际验证：25 项单元测试通过；开发5173和生产预览4173的后台操作链通过；生产构建通过。生产包存在大于500kB的体积提示，构建未失败。本次没有推送或部署。

