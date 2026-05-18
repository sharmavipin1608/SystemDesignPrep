/* @jest-environment node */
import path from 'path'
import { processMarkdown, getTopicHtml } from '@/lib/markdown'

describe('processMarkdown', () => {
  it('converts markdown headings to HTML h2 tags', async () => {
    const html = await processMarkdown('## What is it?\n\nSome content here.')
    expect(html).toContain('<h2')
    expect(html).toContain('What is it?')
    expect(html).toContain('Some content here.')
  })

  it('renders tables via remark-gfm', async () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |'
    const html = await processMarkdown(md)
    expect(html).toContain('<table')
    expect(html).toContain('<td')
  })

  it('leaves mermaid code blocks with language-mermaid class', async () => {
    const md = '```mermaid\ngraph TD\n  A-->B\n```'
    const html = await processMarkdown(md)
    expect(html).toContain('language-mermaid')
  })

  it('strips frontmatter before processing', async () => {
    const md = '---\ntitle: Test\n---\n## Section\n\nBody text.'
    const html = await processMarkdown(md)
    expect(html).not.toContain('title: Test')
    expect(html).toContain('Section')
  })
})

describe('getTopicHtml', () => {
  it('reads and processes a markdown file from content directory', async () => {
    // Uses a real file from the content directory
    const html = await getTopicHtml('caching', 'caching')
    expect(html).toContain('<h2')
  })

  it('throws a clear error when topic does not exist', async () => {
    await expect(getTopicHtml('caching', 'nonexistent-topic')).rejects.toThrow(
      'Topic not found: caching/nonexistent-topic'
    )
  })
})
