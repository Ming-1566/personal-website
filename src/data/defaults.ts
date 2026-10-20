import type { Content } from '../types';

// 仅放入用户已提供并可公开的内容；这不是原始个人资料的副本。
export const defaults: Content = {
  profile: {
    name: '王昱涵', tagline: '软件工程在读大四学生，正在学习 AI 辅助开发。',
    bio: '软件工程专业，喜欢打乒乓球。学习方向是水下图像增强与水下图像质量评估。',
    major: '软件工程', studyStage: '大四在读',
    researchDirections: ['水下图像增强', '水下图像质量评估'], interests: ['乒乓球'],
    education: [], experiences: [], email: '3344362245@qq.com', socialLinks: [],
  },
  skills: ['C', 'Java', 'Python', 'Matlab'].map((name, order) => ({
    id: `language-${order}`, name, category: '编程语言', order,
  })),
  projects: [{ id: 'scenic-guide', slug: 'scenic-guide', title: '景区智能导览系统',
    summary: '已完成开发与部署，相关成果取得中国大学生计算机设计大赛国家级二等奖。',
    bodyMarkdown: '## 项目概述\n\n景区智能导览系统已经完成开发与部署。\n\n## 相关成果\n\n相关成果取得中国大学生计算机设计大赛国家级二等奖。\n\n## 待补充资料\n\n- 项目技术栈：待填写\n- 本人职责：待填写\n- 开发时间：待填写\n- 项目封面和实际截图：待补充\n- 演示地址与仓库地址：待补充',
    tags: [], status: 'published', deliveryStatus: '已开发与部署',
    achievement: '中国大学生计算机设计大赛国家级二等奖', order: 0,
    updatedAt: '2026-10-20T00:00:00.000Z',
  }],
  posts: [],
  settings: { title: '王昱涵 · 个人空间', description: '软件工程、AI 辅助开发与水下图像探索。',
    accentColor: '#7de1d7', footerText: '王昱涵 · 学习与实践',
    starfieldEnabled: true, socialDisplayEnabled: true },
};
