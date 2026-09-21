import fs from 'node:fs';
import path from 'node:path';
import { coreEditorial } from '../src/data/core-editorial.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const gaId = 'G-EEKYMLMF2H';
const categories = JSON.parse(fs.readFileSync(path.join(root, 'src/data/categories.json'), 'utf8'));
const tools = JSON.parse(fs.readFileSync(path.join(root, 'src/data/tools-base.json'), 'utf8'));
const failures = [];
const coreEntries = Object.entries(coreEditorial);
if (coreEntries.length !== 50) failures.push(`Expected 50 curated core pages, got ${coreEntries.length}`);
for (const [slug, entry] of coreEntries) {
  for (const field of ['title', 'h1', 'primary', 'intro', 'use', 'start', 'watch', 'compare']) {
    if (!entry[field] || String(entry[field]).trim().length < 4) failures.push(`${slug}: missing core editorial field ${field}`);
  }
  if (!Array.isArray(entry.headings) || entry.headings.length !== 4) failures.push(`${slug}: expected four custom headings`);
  if (!Array.isArray(entry.secondary) || entry.secondary.length < 2) failures.push(`${slug}: expected secondary keyword plan`);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function routeExists(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return fs.existsSync(path.join(dist, 'index.html'));
  const target = path.join(dist, clean.replace(/^\//, ''));
  if (path.extname(target)) return fs.existsSync(target);
  return fs.existsSync(path.join(target, 'index.html'));
}

function textContent(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function shingles(text, size = 16) {
  const normalized = text.replace(/[\s，。；：、“”‘’！？（）·]/g, '');
  const set = new Set();
  for (let index = 0; index <= normalized.length - size; index += 2) set.add(normalized.slice(index, index + size));
  return set;
}

function jaccard(left, right) {
  let intersection = 0;
  for (const item of left) if (right.has(item)) intersection += 1;
  return intersection / (left.size + right.size - intersection || 1);
}

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const toolFiles = htmlFiles.filter((file) => /\/tools\/[^/]+\/index\.html$/.test(file) && !file.endsWith('/tools/index.html'));
if (htmlFiles.length !== 321) failures.push(`Expected 321 HTML files, got ${htmlFiles.length}`);
if (toolFiles.length !== 300) failures.push(`Expected 300 tool pages, got ${toolFiles.length}`);

const titles = new Map();
const h1s = new Map();
const forbidden = ['为了 SEO', '为了SEO', 'GEO 优化', '内容策略', '编辑规则', '维护记录', '核验日期', '核验说明', '维护说明', '站点规划', '内部编辑', '模板字段', '本文由 AI', 'AI 生成文章'];
const political = ['政治人物', '政治宣传', '绕过审查'];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(dist, file);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const h1Matches = [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/g)];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!title) failures.push(`${relative}: missing title`);
  if (h1Matches.length !== 1) failures.push(`${relative}: expected one H1, got ${h1Matches.length}`);
  if (!canonical) failures.push(`${relative}: missing canonical`);
  if (!html.includes(`<meta name="description"`)) failures.push(`${relative}: missing description`);
  if (!html.includes(`data-ga-id="${gaId}"`)) failures.push(`${relative}: missing consent-gated GA4 ID`);
  if (!html.includes('application/ld+json') && relative !== '404.html') failures.push(`${relative}: missing JSON-LD`);
  if (html.includes('https://www.googletagmanager.com/gtag/js')) failures.push(`${relative}: GA4 must not load before consent`);
  for (const value of forbidden) if (html.includes(value)) failures.push(`${relative}: leaked internal phrase ${value}`);
  for (const value of political) if (html.includes(value)) failures.push(`${relative}: contains excluded sensitive phrase ${value}`);
  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) if (!routeExists(match[1])) failures.push(`${relative}: broken internal link ${match[1]}`);
  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(block[1]); } catch { failures.push(`${relative}: invalid JSON-LD`); }
  }
  if (title) {
    if (titles.has(title)) failures.push(`${relative}: duplicate title with ${titles.get(title)}`);
    titles.set(title, relative);
  }
  if (h1Matches[0]) {
    const h1 = textContent(h1Matches[0][1]);
    if (h1s.has(h1)) failures.push(`${relative}: duplicate H1 with ${h1s.get(h1)}`);
    h1s.set(h1, relative);
  }
}

for (const file of toolFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(dist, file);
  const article = html.match(/<article class="[^"]*article-body[^"]*">([\s\S]*?)<\/article>/)?.[1] ?? '';
  const bodyText = textContent(article);
  const isNoindex = html.includes('<meta name="robots" content="noindex,follow">');
  const minLength = isNoindex ? 90 : 350;
  if (bodyText.length < minLength) failures.push(`${relative}: tool article too short (${bodyText.length}, expected ${minLength}+)`);
  if ((html.match(/data-tool-open/g) || []).length !== 1) failures.push(`${relative}: expected one official CTA`);
  if (!/rel="noopener noreferrer external"/.test(html)) failures.push(`${relative}: official link rel missing`);
  if ((html.match(/data-promo-click/g) || []).length !== 1) failures.push(`${relative}: expected one promo`);
  if (!/rel="sponsored noopener noreferrer"/.test(html)) failures.push(`${relative}: sponsored rel missing`);
}

const index = JSON.parse(fs.readFileSync(path.join(dist, 'assets/search-index.json'), 'utf8'));
if (index.length !== 300) failures.push(`Search index expected 300 items, got ${index.length}`);
const summaries = new Map();
for (const item of index) {
  if (summaries.has(item.summary)) failures.push(`Duplicate summary: ${item.name} / ${summaries.get(item.summary)}`);
  summaries.set(item.summary, item.name);
}

let maxSimilarity = { score: 0, left: '', right: '' };
for (const category of categories) {
  const members = tools.filter((tool) => tool.categoryId === category.id);
  const articleSets = members.map((tool) => {
    const html = fs.readFileSync(path.join(dist, 'tools', tool.slug, 'index.html'), 'utf8');
    const article = html.match(/<article class="[^"]*article-body[^"]*">([\s\S]*?)<\/article>/)?.[1] ?? '';
    return { slug: tool.slug, set: shingles(textContent(article)) };
  });
  for (let left = 0; left < articleSets.length; left += 1) {
    for (let right = left + 1; right < articleSets.length; right += 1) {
      const score = jaccard(articleSets[left].set, articleSets[right].set);
      if (score > maxSimilarity.score) maxSimilarity = { score, left: articleSets[left].slug, right: articleSets[right].slug };
    }
  }
}
if (maxSimilarity.score > 0.62) failures.push(`Article similarity too high: ${maxSimilarity.left} / ${maxSimilarity.right} = ${maxSimilarity.score.toFixed(3)}`);

const repeatedSentences = new Map();
for (const file of toolFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const article = html.match(/<article class="[^"]*article-body[^"]*">([\s\S]*?)<\/article>/)?.[1] ?? '';
  const withoutPromo = article.replace(/<aside class="promo"[\s\S]*?<\/aside>/g, ' ');
  const text = textContent(withoutPromo);
  for (const raw of text.split(/[。！？；]/)) {
    const sentence = raw.trim();
    if (sentence.length < 28) continue;
    repeatedSentences.set(sentence, (repeatedSentences.get(sentence) || 0) + 1);
  }
}
const excessiveSentence = [...repeatedSentences.entries()].sort((a, b) => b[1] - a[1]).find(([, count]) => count > 20);
if (excessiveSentence) failures.push(`Long sentence reused across too many tool pages (${excessiveSentence[1]}): ${excessiveSentence[0]}`);

const noindexFiles = htmlFiles.filter((file) => fs.readFileSync(file, 'utf8').includes('<meta name="robots" content="noindex,follow">'));
if (noindexFiles.length !== 251) failures.push(`Expected 251 noindex pages (250 unverified tools + 404), got ${noindexFiles.length}`);
const verifiedToolPages = toolFiles.filter((file) => !fs.readFileSync(file, 'utf8').includes('<meta name="robots" content="noindex,follow">'));
if (verifiedToolPages.length !== 50) failures.push(`Expected 50 indexable verified tool pages, got ${verifiedToolPages.length}`);

for (const file of toolFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(dist, file);
  for (const phrase of ['迁移正式项目、团队成员或更多资料', '完成一次输入、处理和结果检查', '把任务拆成输入、处理、检查三步', '不把自动结果直接当成最终版本']) {
    if (html.includes(phrase)) failures.push(`${relative}: generic workflow phrase should not appear`);
  }
}

for (const file of verifiedToolPages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(dist, file);
  for (const phrase of ['完成一次输入、处理和结果检查', '迁移正式项目、团队成员或更多资料', '把任务拆成输入、处理、检查三步']) {
    if (html.includes(phrase)) failures.push(`${relative}: legacy generic workflow leaked into curated page`);
  }
}
for (const file of toolFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (/。。|。；|；。/.test(html)) failures.push(`${path.relative(dist, file)}: malformed punctuation`);
}


const homeHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const commonSection = homeHtml.match(/<section class="content-section" id="common-tools">([\s\S]*?)<\/section>/)?.[1] || '';
const commonLinks = [...commonSection.matchAll(/href="\/tools\/([^/]+)\/"/g)].map((match) => match[1]);
if (new Set(commonLinks).size !== 15) failures.push(`Homepage common tools expected 15 unique representatives, got ${new Set(commonLinks).size}`);

const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const sitemapCount = (sitemap.match(/<url>/g) || []).length;
if (sitemapCount !== 70) failures.push(`Sitemap expected 70 URLs, got ${sitemapCount}`);
if (sitemap.includes('/404')) failures.push('Sitemap contains 404');
if (sitemap.includes('<lastmod>')) failures.push('Sitemap should not emit unverifiable lastmod values');

const requiredAssets = ['styles.css', 'app.js', 'search-index.json', 'favicon.svg', 'og-cover.png', 'mayin-huyue-banner-desktop.webp', 'mayin-huyue-banner-mobile.webp'];
for (const asset of requiredAssets) if (!fs.existsSync(path.join(dist, 'assets', asset))) failures.push(`Missing asset ${asset}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({ htmlFiles: htmlFiles.length, toolPages: toolFiles.length, sitemapUrls: sitemapCount, uniqueTitles: titles.size, uniqueH1s: h1s.size, maxArticleSimilarity: Number(maxSimilarity.score.toFixed(3)), closestPair: [maxSimilarity.left, maxSimilarity.right] }, null, 2));
