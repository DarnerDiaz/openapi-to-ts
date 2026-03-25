#!/usr/bin/env node

/**
 * Publicar artículos en Dev.to automáticamente
 * Uso: npm run publish-devto -- --file=./DEVTO_ARTICLE.md --title="Mi Artículo" --tags=typescript,devtools
 */

import * as fs from 'fs';
import * as path from 'path';

interface DevtoArticle {
  title: string;
  description: string;
  body_markdown: string;
  tags: string[];
  published: boolean;
  cover_image?: string;
  canonical_url?: string;
}

interface DevtoResponse {
  id: number;
  title: string;
  slug: string;
  url: string;
  body_markdown: string;
  published: boolean;
  published_at: string;
}

async function publishToDevto(articleData: DevtoArticle): Promise<DevtoResponse> {
  const apiToken = process.env.DEVTO_API_KEY;
  
  if (!apiToken) {
    throw new Error(
      '❌ DEVTO_API_KEY not found. Set it with:\nexport DEVTO_API_KEY="your_api_key_here"'
    );
  }

  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': apiToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      article: articleData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Dev.to API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function updateArticleOnDevto(articleId: number, articleData: DevtoArticle): Promise<DevtoResponse> {
  const apiToken = process.env.DEVTO_API_KEY;
  
  if (!apiToken) {
    throw new Error('❌ DEVTO_API_KEY not found');
  }

  const response = await fetch(`https://dev.to/api/articles/${articleId}`, {
    method: 'PUT',
    headers: {
      'api-key': apiToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      article: articleData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Dev.to API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

function parseMarkdownFile(filePath: string): { content: string, metadata?: Record<string, string> } {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for front matter (YAML)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (frontmatterMatch) {
    const metadata: Record<string, string> = {};
    const frontmatter = frontmatterMatch[1];
    const body = frontmatterMatch[2];
    
    frontmatter.split('\n').forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        metadata[key] = value;
      }
    });
    
    return { content: body, metadata };
  }
  
  return { content };
}

function extractTitleAndDescription(markdown: string): { title: string; description: string } {
  const titleMatch = markdown.match(/^#\s+(.+?)(?:\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
  
  // Get first paragraph as description
  const descMatch = markdown.match(/\n\n(.+?)(?:\n\n|\n##|\n#)/);
  const description = descMatch ? descMatch[1].trim().substring(0, 160) : '';
  
  return { title, description };
}

async function main() {
  const args = process.argv.slice(2);
  const options: Record<string, string> = {};
  
  args.forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    options[key] = value;
  });
  
  if (!options.file) {
    console.error('Usage: npm run publish-devto -- --file=./ARTICLE.md [--tags=tag1,tag2] [--id=article_id]');
    process.exit(1);
  }
  
  try {
    const filePath = path.resolve(options.file);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const { content, metadata } = parseMarkdownFile(filePath);
    const { title, description } = extractTitleAndDescription(content);
    
    const tags = (options.tags || 'javascript,webdev').split(',').map(t => t.trim()).slice(0, 4);
    
    const articleData: DevtoArticle = {
      title: metadata?.title || title,
      description: metadata?.description || description,
      body_markdown: content,
      tags,
      published: options.draft !== 'true',
      cover_image: metadata?.cover_image,
      canonical_url: metadata?.canonical_url,
    };
    
    console.log('📝 Publishing to Dev.to...');
    console.log(`  Title: ${articleData.title}`);
    console.log(`  Tags: ${articleData.tags.join(', ')}`);
    console.log(`  Published: ${articleData.published}`);
    
    let result: DevtoResponse;
    
    if (options.id) {
      result = await updateArticleOnDevto(parseInt(options.id), articleData);
      console.log(`\n✅ Article updated successfully!`);
    } else {
      result = await publishToDevto(articleData);
      console.log(`\n✅ Article published successfully!`);
    }
    
    console.log(`\n📖 URL: https://dev.to/${result.slug}`);
    console.log(`🔗 Full: ${result.url}`);
    
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
