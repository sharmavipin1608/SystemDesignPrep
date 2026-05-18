import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { readFileSync } from 'fs'
import path from 'path'

export async function processMarkdown(raw: string): Promise<string> {
  const { content } = matter(raw)
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight, { ignoreMissing: true })
    .use(rehypeStringify)
    .process(content)
  return String(result)
}

export async function getTopicHtml(groupSlug: string, topicSlug: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'content', groupSlug, `${topicSlug}.md`)
  const raw = readFileSync(filePath, 'utf-8')
  return processMarkdown(raw)
}
