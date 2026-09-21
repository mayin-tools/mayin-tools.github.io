import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const memoryRoot = '/workspace/memory/sites';

const categories = [
  { id: 'ai-tools', name: 'AI 与智能办公', path: 'ai-tools', short: 'AI 助手、研究与智能办公' },
  { id: 'translation-writing', name: '翻译与写作', path: 'translation-writing-tools', short: '翻译、校对与英文写作' },
  { id: 'design-image', name: '设计与图片', path: 'design-image-tools', short: '设计、图片编辑与素材' },
  { id: 'video-subtitle', name: '视频与字幕', path: 'video-subtitle-tools', short: '剪辑、录屏、字幕与视频转换' },
  { id: 'audio-voice', name: '音频与语音', path: 'audio-voice-tools', short: '录音、配音与音频处理' },
  { id: 'website-cms', name: '建站与 CMS', path: 'website-cms-tools', short: '独立站、博客与内容管理' },
  { id: 'developer-api', name: '开发与 API', path: 'developer-api-tools', short: '代码、接口、部署与测试' },
  { id: 'domain-network-security', name: '域名、网络与安全', path: 'domain-network-security-tools', short: '域名、DNS、CDN 与安全检查' },
  { id: 'project-collaboration', name: '项目与团队协作', path: 'project-collaboration-tools', short: '项目、任务、白板与知识库' },
  { id: 'meeting-remote-work', name: '会议与远程办公', path: 'meeting-remote-work-tools', short: '会议、排期、时区与远程协助' },
  { id: 'document-pdf', name: '文档与 PDF', path: 'document-pdf-tools', short: '文档编辑、PDF 与电子签署' },
  { id: 'file-cloud-storage', name: '文件与云存储', path: 'file-cloud-storage-tools', short: '传输、同步、备份与格式转换' },
  { id: 'analytics-seo', name: '数据与 SEO', path: 'analytics-seo-tools', short: '趋势、分析、搜索与性能诊断' },
  { id: 'marketing-social', name: '营销与社媒', path: 'marketing-social-tools', short: '邮件、社媒、广告与内容运营' },
  { id: 'ecommerce-customer-service', name: '电商与客户服务', path: 'ecommerce-customer-service-tools', short: '电商、支付、CRM 与客服' }
];

const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));

const originalCategoryByName = new Map(Object.entries({
  ChatGPT: 'AI 与智能办公', Claude: 'AI 与智能办公', 'Google Gemini': 'AI 与智能办公', Perplexity: 'AI 与智能办公',
  DeepL: '翻译与写作', 'Google 翻译': '翻译与写作', Grammarly: '翻译与写作', LanguageTool: '翻译与写作',
  Canva: '设计与图片', Figma: '设计与图片', 'Adobe Express': '设计与图片', Photopea: '设计与图片', Unsplash: '设计与图片', Pexels: '设计与图片', Pixabay: '设计与图片', Flaticon: '设计与图片', 'Google Fonts': '设计与图片',
  CapCut: '视频与字幕', Descript: '视频与字幕', ElevenLabs: '音频与语音',
  'WordPress.com': '建站与 CMS', Webflow: '建站与 CMS',
  GitHub: '开发与 API', GitLab: '开发与 API', Vercel: '开发与 API', Netlify: '开发与 API', Postman: '开发与 API',
  Cloudflare: '域名、网络与安全', Namecheap: '域名、网络与安全',
  Notion: '项目与团队协作', Trello: '项目与团队协作', Asana: '项目与团队协作', ClickUp: '项目与团队协作', Slack: '项目与团队协作',
  Zoom: '会议与远程办公', 'Google Workspace': '会议与远程办公', 'Microsoft 365': '会议与远程办公', Calendly: '会议与远程办公', 'World Time Buddy': '会议与远程办公',
  'Google Trends': '数据与 SEO', 'Google Search Console': '数据与 SEO', 'Google Analytics': '数据与 SEO', Similarweb: '数据与 SEO', 'Ahrefs Webmaster Tools': '数据与 SEO', Semrush: '数据与 SEO',
  Mailchimp: '营销与社媒', Buffer: '营销与社媒', 'TikTok Creative Center': '营销与社媒',
  Shopify: '电商与客户服务', HubSpot: '电商与客户服务'
}));

function parseOriginalCatalog() {
  const text = fs.readFileSync(path.join(memoryRoot, 'site-03-mayin-tool-catalog.md'), 'utf8');
  const tools = [];
  const rowPattern = /^\| ([^|]+?) \| `([^`]+)` \| <(https:\/\/[^>]+)> \| ([^|]+?) \| ([^|]+?) \|$/gm;
  for (const match of text.matchAll(rowPattern)) {
    const [, name, slug, officialUrl, purpose, note] = match;
    const categoryName = originalCategoryByName.get(name.trim());
    if (!categoryName) throw new Error(`Missing new category for ${name}`);
    tools.push({ name: name.trim(), slug, officialUrl, categoryId: categoryIdByName.get(categoryName), seedPurpose: purpose.trim(), seedNote: note.trim(), sourceBatch: 0 });
  }
  return tools;
}

function parseBatchOne() {
  const text = fs.readFileSync(path.join(memoryRoot, 'site-03-mayin-expansion-batch-01.md'), 'utf8');
  const tools = [];
  const rowPattern = /^\| ([^|]+?) \| ([^|]+?) \| `([^`]+)` \| <(https:\/\/[^>]+)> \|$/gm;
  for (const match of text.matchAll(rowPattern)) {
    const [, categoryName, name, slug, officialUrl] = match;
    const categoryId = categoryIdByName.get(categoryName.trim());
    if (!categoryId) throw new Error(`Unknown category ${categoryName}`);
    tools.push({ name: name.trim(), slug, officialUrl, categoryId, sourceBatch: 1 });
  }
  return tools;
}

function parseBatchTwo() {
  const text = fs.readFileSync(path.join(memoryRoot, 'site-03-mayin-expansion-batch-02.md'), 'utf8');
  const tools = [];
  let currentCategoryId = null;
  for (const line of text.split('\n')) {
    const heading = line.match(/^## (.+?)（\d+）$/);
    if (heading) currentCategoryId = categoryIdByName.get(heading[1]) ?? null;
    const row = line.match(/^\| ([^|]+?) \| `([^`]+)` \| <(https:\/\/[^>]+)> \|$/);
    if (!row) continue;
    if (!currentCategoryId) throw new Error(`Missing category for ${row[1]}`);
    tools.push({ name: row[1].trim(), slug: row[2], officialUrl: row[3], categoryId: currentCategoryId, sourceBatch: 2 });
  }
  return tools;
}

const tools = [...parseOriginalCatalog(), ...parseBatchOne(), ...parseBatchTwo()];
const slugs = new Set(tools.map((tool) => tool.slug));
if (tools.length !== 300) throw new Error(`Expected 300 tools, got ${tools.length}`);
if (slugs.size !== tools.length) throw new Error('Duplicate tool slugs found');

for (const tool of tools) {
  if (!tool.officialUrl.startsWith('https://')) throw new Error(`Non-HTTPS URL: ${tool.name}`);
  tool.domain = new URL(tool.officialUrl).hostname.replace(/^www\./, '');
  tool.lastVerified = '2026-09-21';
}

const distribution = Object.fromEntries(categories.map((category) => [category.id, tools.filter((tool) => tool.categoryId === category.id).length]));
if (Object.values(distribution).reduce((total, count) => total + count, 0) !== 300) throw new Error('Category distribution mismatch');

fs.mkdirSync(path.join(projectRoot, 'src', 'data'), { recursive: true });
fs.writeFileSync(path.join(projectRoot, 'src', 'data', 'categories.json'), `${JSON.stringify(categories, null, 2)}\n`);
fs.writeFileSync(path.join(projectRoot, 'src', 'data', 'tools-base.json'), `${JSON.stringify(tools, null, 2)}\n`);
console.log(JSON.stringify({ tools: tools.length, distribution }, null, 2));
