import GithubSlugger from 'github-slugger';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import type { Root } from 'mdast';

export interface MarkdownHeading { id: string; text: string; depth: number }
export function collectHeadings(tree: Root, assignIds = false): MarkdownHeading[] {
  const slugger = new GithubSlugger();
  const headings: MarkdownHeading[] = [];
  visit(tree, 'heading', (node) => {
    const text = toString(node);
    const id = `md-${slugger.slug(text) || 'section'}`;
    headings.push({ id, text: text || '未命名章节', depth: node.depth });
    if (assignIds) {
      node.data ??= {}; node.data.hProperties = { ...node.data.hProperties, id };
    }
  });
  return headings;
}
export function getMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  return collectHeadings(tree);
}
export function remarkHeadingIds() {
  return (tree: Root) => { collectHeadings(tree, true); };
}
