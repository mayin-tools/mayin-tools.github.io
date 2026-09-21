import fs from 'node:fs';
import path from 'node:path';
import { categoryContent, headingSets, purposeByCategory } from '../src/data/content-seeds.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const baseUrl = 'https://mayin-tools.github.io';
const gaId = 'G-EEKYMLMF2H';
const categories = JSON.parse(fs.readFileSync(path.join(root, 'src/data/categories.json'), 'utf8'));
const baseTools = JSON.parse(fs.readFileSync(path.join(root, 'src/data/tools-base.json'), 'utf8'));
const categoryById = new Map(categories.map((category) => [category.id, category]));

const titlePatterns = [
  (name) => `${name} 怎么用？用途、入口与注意事项`,
  (name) => `准备使用 ${name}，先看它适合什么`,
  (name) => `${name} 适合做什么？从一个实际任务开始`,
  (name) => `了解 ${name} 前，有哪些地方要注意`,
  (name) => `${name} 使用说明：先判断是否适合你的任务`,
  (name) => `第一次打开 ${name}，可以先了解这些`,
  (name) => `${name}：主要用途、开始方式与使用边界`,
  (name) => `什么时候会用到 ${name}？`,
  (name) => `${name} 官方网站入口与实用说明`,
  (name) => `选择 ${name} 前，先弄清用途和限制`
];

const introPatterns = [
  (tool) => `${tool.purpose} 如果它和你手头的需求接近，可以先从一个范围明确的小任务试起，再决定是否把它放进长期流程。`,
  (tool, content) => `${tool.purpose} 对${content.audience}来说，先用真实但不敏感的材料体验一次，比只看功能列表更容易判断是否合适。`,
  (tool, content) => `${tool.name} 不需要被包装成万能工具。${tool.purpose} 它的价值主要取决于你的任务是否清楚，以及你是否愿意在完成后检查结果。`,
  (tool) => `${tool.purpose} 第一次使用 ${tool.name} 不妨缩小范围，看看操作方式和输出是否贴合自己的工作习惯。`,
  (tool, content) => `${tool.purpose} 它更适合${content.audience}。如果只是偶尔完成一次任务，先从网页入口和基础流程开始，通常比一上来研究所有高级功能更省时间。`,
  (tool) => `先说结论：${tool.purpose} 是否值得长期使用，还要看账号条件、协作方式和结果检查成本。`,
  (tool) => `很多人找到 ${tool.name}，是因为它的核心用途正好贴近手头工作。${tool.purpose} 使用前先想清楚最终要交付什么，往往能少走弯路。`,
  (tool, content) => `${tool.name} 的定位并不复杂：${tool.purpose} 对第一次接触这类服务的人来说，先完成一个小样例，再决定要不要迁移完整工作流会更稳妥。`,
  (tool) => `如果这项用途正是你要解决的问题，${tool.name} 可以放进候选清单。${tool.purpose} 下面重点讲怎么开始，以及哪些地方需要自己把关。`,
  (tool, content) => `${tool.purpose} ${tool.name} 适合在目标明确时使用；先准备好输入材料、输出要求和检查标准，实际体验会比漫无目的地试功能更有参考价值。`
];

const startPatterns = [
  (tool) => `打开 ${tool.domain} 后，先找与页面所述核心用途最接近的入口。不要急着导入全部资料，用一个可撤回的小样例熟悉界面和结果。`,
  (tool) => `可以先定一个十几分钟能完成的目标。完成后再看 ${tool.name} 是否需要注册、邀请成员或连接其他服务。`,
  () => `准备一份不含敏感信息的测试材料，先跑完一次最短流程。确认输出方式、导出格式和后续修改成本后，再扩大使用范围。`,
  (tool) => `第一次使用 ${tool.name} 时只解决一个具体问题。这样更容易判断操作逻辑是否顺手，也能避免被不相关功能分散注意力。`,
  () => `先从官网主入口了解当前可用方式，再跑一遍完整流程。涉及团队协作时，最后再设置成员和权限。`,
  (tool) => `把任务拆成输入、处理、检查三步。先用 ${tool.name} 完成一个小样例，然后对照原材料检查结果，确认没问题再继续下一步。`
];

const evaluationSets = [
  ['核心用途是否正好对应当前问题', '导入、导出和后续修改是否顺手', '账号、权限与费用是否符合使用条件'],
  ['先确认要得到什么结果', '再看是否需要上传文件或连接账号', '最后检查结果能否继续编辑或迁移'],
  ['用一个小任务测试操作路径', '核对共享范围和数据设置', '比较长期使用与偶尔使用的成本'],
  ['看清官网当前提供的使用方式', '确认关键资料是否适合交给第三方处理', '给最终结果留出人工检查时间'],
  ['先判断它解决的是否是同一个问题', '再比较协作、权限和输出方式', '涉及付费时查看官网当前方案'],
  ['从最常遇到的一次任务开始', '记录完成过程里真正费时间的环节', '再决定是否迁移更多资料或团队成员']
];

const decisionPatterns = [
  (tool, content) => `真正需要留意的是：${tool.caution}。另外，${content.cautions[(tool.categoryIndex + 1) % content.cautions.length]}。这些问题通常比功能多少更影响实际体验。`,
  (tool, content) => `选择前先看两个地方：一是官网当前提供的账号和方案，二是你的材料会不会离开本地设备。${tool.caution}，重要结果也不要省略人工检查。`,
  (tool, content) => `${tool.name} 只是工作流程的一部分。${tool.caution}；同时要给最终输出留出复核时间，不要把自动处理结果直接当成定稿。`,
  (tool, content) => `如果任务涉及客户资料、未公开文件或账号权限，应先确认组织内部要求。${tool.caution}，官网的功能和使用条件也可能随时间调整。`,
  (tool, content) => `别只看首页展示的功能。实际使用中更重要的是导入和导出方式、成员权限以及能否撤回操作。${tool.caution}。`,
  (tool, content) => `使用边界需要自己把握：${tool.caution}。遇到费用、许可或地区条件时，以 ${tool.domain} 当时显示的说明为准。`
];

function esc(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function plain(value) {
  return String(value).replace(/[<>]/g, '').trim();
}

const tools = [];
for (const category of categories) {
  const categoryTools = baseTools.filter((tool) => tool.categoryId === category.id);
  const purposes = purposeByCategory[category.id];
  if (!purposes || purposes.length !== categoryTools.length) throw new Error(`Purpose count mismatch for ${category.id}: ${purposes?.length} / ${categoryTools.length}`);
  categoryTools.forEach((tool, categoryIndex) => {
    const content = categoryContent[category.id];
    const tasks = [0, 2, 4].map((offset) => content.tasks[(categoryIndex + offset) % content.tasks.length]);
    const title = titlePatterns[(categoryIndex + categories.indexOf(category)) % titlePatterns.length](tool.name, category);
    tools.push({
      ...tool,
      categoryIndex,
      category,
      purpose: purposes[categoryIndex],
      summary: purposes[categoryIndex],
      tasks,
      caution: content.cautions[categoryIndex % content.cautions.length],
      title,
      h1: title,
      description: `${tool.name} 用途介绍：${purposes[categoryIndex].replace(/[。！]$/, '')}。了解开始方式和注意事项，并从本站前往官方网站。`.slice(0, 155)
    });
  });
}

const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

function write(relativePath, content) {
  const target = path.join(dist, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function gaTag() {
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');</script>`;
}

function header(current = '') {
  return `<a class="skip-link" href="#main">跳到主要内容</a>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/"><span class="brand-mark">↗</span> 迈引导航</a>
    <nav class="main-nav" data-main-nav aria-label="主导航">
      <a href="/"${current === 'home' ? ' aria-current="page"' : ''}>首页</a>
      <a href="/tools/"${current === 'tools' ? ' aria-current="page"' : ''}>全部工具</a>
      <a href="/#categories">分类</a>
      <a href="/about/"${current === 'about' ? ' aria-current="page"' : ''}>关于</a>
    </nav>
    <div class="header-actions">
      <button class="icon-button" type="button" data-favorite-open aria-label="打开我的收藏" title="我的收藏">☆</button>
      <button class="icon-button menu-button" type="button" data-menu-button aria-label="打开导航菜单" aria-expanded="false" title="菜单">☰</button>
    </div>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-inner">
    <div><h2>迈引导航</h2><p>为中文用户整理跨境办公与出海常用工具入口。</p></div>
    <div class="footer-links"><h2>浏览</h2><a href="/tools/">全部工具</a><a href="/#categories">工具分类</a><a href="/about/">关于本站</a></div>
    <div class="footer-links"><h2>说明</h2><a href="/privacy/">隐私政策</a><a href="/terms/">使用条款</a><a href="https://github.com/mayin-tools/mayin-tools.github.io/issues" target="_blank" rel="noopener noreferrer external">反馈问题</a></div>
  </div>
  <div class="container footer-bottom">© 2026 迈引导航 · 第三方工具导航，与所列工具运营方无隶属关系。</div>
</footer>
<aside class="favorite-drawer" data-favorite-drawer hidden aria-label="我的收藏">
  <button class="drawer-scrim" type="button" data-favorite-close aria-label="关闭收藏"></button>
  <div class="drawer-panel" tabindex="-1"><div class="drawer-head"><h2>我的收藏</h2><button class="icon-button" type="button" data-favorite-close aria-label="关闭收藏">×</button></div><ul class="favorite-list" data-favorite-list></ul></div>
</aside>`;
}

function htmlPage({ title, description, canonical, body, current = '', jsonLd = [] }) {
  const graph = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:site_name" content="迈引导航">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${baseUrl}/assets/og-cover.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/styles.css">
  ${gaTag()}
  ${graph.filter(Boolean).map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join('\n  ')}
</head>
<body>
${header(current)}
${body}
${footer()}
<script src="/assets/app.js" defer></script>
</body>
</html>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs container" aria-label="面包屑"><ol>${items.map((item, index) => `<li>${item.url && index < items.length - 1 ? `<a href="${item.url}">${esc(item.name)}</a>` : `<span aria-current="page">${esc(item.name)}</span>`}</li>`).join('')}</ol></nav>`;
}

function breadcrumbJson(items) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, ...(item.url ? { item: `${baseUrl}${item.url}` } : {}) })) };
}

function promo(placement) {
  return `<aside class="promo container" aria-label="推广内容"><p class="promo-label">推广</p><a href="https://huyuejsq.co/" target="_blank" rel="sponsored noopener noreferrer" data-promo-click data-placement="${placement}"><picture><source media="(max-width: 720px)" srcset="/assets/mayin-huyue-banner-mobile.webp" type="image/webp"><source srcset="/assets/mayin-huyue-banner-desktop.webp" type="image/webp"><source media="(max-width: 720px)" srcset="/assets/mayin-huyue-banner-mobile.png"><img src="/assets/mayin-huyue-banner-desktop.png" alt="虎跃加速，多平台网络连接工具推广" width="1200" height="400" loading="lazy"></picture></a></aside>`;
}

function searchBox() {
  return `<div class="search-shell"><label class="search-label" for="site-search">搜索工具名称、用途或分类</label><input class="search-input" id="site-search" data-search-input type="search" autocomplete="off" placeholder="例如：翻译、PDF、建站、视频字幕"><button class="search-clear" type="button" data-search-clear hidden aria-label="清空搜索">×</button><div class="search-results" data-search-results hidden><p class="search-status" data-search-status aria-live="polite"></p><ul class="search-list" data-search-list></ul></div></div>`;
}

function toolItem(tool) {
  return `<article class="tool-item"><div class="tool-item-title"><span class="tool-initial" aria-hidden="true">${esc(tool.name[0].toUpperCase())}</span><div><h3><a href="/tools/${tool.slug}/">${esc(tool.name)}</a></h3><div class="tool-domain">${esc(tool.domain)}</div></div></div><p class="tool-summary">${esc(tool.summary)}</p><div class="tool-meta"><span class="tool-tag">${esc(tool.category.name)}</span><a class="tool-link" href="/tools/${tool.slug}/">查看介绍</a></div></article>`;
}

function categoryLinks() {
  return `<div class="category-links">${categories.map((category) => `<a class="category-link" href="/${category.path}/"><strong>${esc(category.name)}</strong><span>${tools.filter((tool) => tool.categoryId === category.id).length} 个入口</span></a>`).join('')}</div>`;
}

function selectFeatured() {
  return categories.flatMap((category) => tools.filter((tool) => tool.categoryId === category.id).slice(0, 3));
}

function homePage() {
  const featured = selectFeatured();
  const body = `<main id="main">
  <section class="page-intro"><div class="container"><p class="eyebrow">迈引导航</p><h1>跨境办公与出海工具导航</h1><p class="lead">按任务查找 AI、翻译、设计、建站、协作、数据和营销工具。先看清用途与限制，再前往官方网站。</p>${searchBox()}</div></section>
  <section class="category-strip" id="categories"><div class="container"><h2>按任务分类</h2>${categoryLinks()}</div></section>
  <section class="content-section" id="common-tools"><div class="container"><div class="section-heading"><div><h2>常用入口</h2><p>从每类选出三个容易遇到的工具，方便快速开始。</p></div><a href="/tools/">查看全部 300 个</a></div><div class="tool-grid">${featured.slice(0, 15).map(toolItem).join('')}</div></div></section>
  ${promo('home_after_first_group')}
  <section class="content-section"><div class="container"><div class="tool-grid">${featured.slice(15).map(toolItem).join('')}</div></div></section>
  <section class="content-section"><div class="container"><div class="section-heading"><div><h2>从手头的工作开始</h2><p>不必先记住工具名，先选你要完成的事情。</p></div></div><div class="workflow-list"><a class="workflow-link" href="/translation-writing-tools/"><strong>写英文内容</strong><span>翻译、校对和调整语气</span></a><a class="workflow-link" href="/design-image-tools/"><strong>制作出海素材</strong><span>图片、字体、图标和配色</span></a><a class="workflow-link" href="/website-cms-tools/"><strong>搭建网站</strong><span>官网、博客和落地页</span></a><a class="workflow-link" href="/meeting-remote-work-tools/"><strong>安排远程协作</strong><span>会议、时区和排期</span></a><a class="workflow-link" href="/analytics-seo-tools/"><strong>分析网站表现</strong><span>搜索、流量和性能诊断</span></a></div></div></section>
  </main>`;
  const itemList = { '@type': 'ItemList', itemListElement: featured.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.name, url: `${baseUrl}/tools/${tool.slug}/` })) };
  return htmlPage({ title: '迈引导航｜跨境办公与出海工具导航', description: '面向中文用户的跨境办公与出海工具导航，整理 AI、翻译、设计、建站、协作、数据、营销和电商等常用官方网站入口。', canonical: `${baseUrl}/`, current: 'home', body, jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: '迈引导航', url: `${baseUrl}/`, inLanguage: 'zh-CN' }, { '@context': 'https://schema.org', ...itemList }] });
}

function allToolsPage() {
  const body = `<main id="main">${breadcrumbs([{ name: '首页', url: '/' }, { name: '全部工具' }])}<section class="category-head"><div class="container"><p class="eyebrow">300 个入口</p><h1>全部工具</h1><p>按名称或用途搜索，也可以从下方分类进入。每个入口先打开本站介绍页，再由你决定是否前往官方网站。</p>${searchBox()}</div></section>${categories.map((category) => { const list = tools.filter((tool) => tool.categoryId === category.id); return `<section class="content-section"><div class="container"><div class="section-heading"><div><h2>${esc(category.name)}</h2><p>${esc(category.short)}</p></div><a href="/${category.path}/">查看分类</a></div><div class="tool-grid">${list.map(toolItem).join('')}</div></div></section>`; }).join('')}</main>`;
  return htmlPage({ title: '全部工具｜迈引导航', description: '浏览迈引导航收录的 300 个跨境办公与出海工具，涵盖 AI、翻译、设计、视频、建站、协作、文档、SEO、营销和电商。', canonical: `${baseUrl}/tools/`, current: 'tools', body, jsonLd: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: '全部工具', url: `${baseUrl}/tools/`, inLanguage: 'zh-CN' }, { '@context': 'https://schema.org', ...breadcrumbJson([{ name: '首页', url: '/' }, { name: '全部工具' }]) }] });
}

const categoryIntros = {
  'ai-tools': '这里整理通用助手、研究工具和智能办公入口。选择时先看任务类型、资料来源和数据设置，不必把模型数量当成唯一标准。',
  'translation-writing': '翻译、校对和改写工具解决的问题并不相同。先判断你处理的是短句、长文、专业术语还是正式发布内容，再选择合适入口。',
  'design-image': '从在线设计到开源软件，从图片压缩到字体素材，这一类工具适合制作出海视觉内容。使用素材前仍要确认具体许可。',
  'video-subtitle': '这里包括视频剪辑、录屏、字幕、托管和格式转换工具。先从发布平台、素材时长和协作方式判断需要哪一类。',
  'audio-voice': '录音、降噪、配音和语音生成各有不同工作流。涉及他人声音、音乐或客户录音时，先处理好授权与隐私。',
  'website-cms': '建站平台在托管、自由度、迁移和学习成本上差异很大。先明确要做官网、博客、落地页还是内容社区。',
  'developer-api': '这里汇集代码托管、在线开发、接口调试和部署平台。公开项目、密钥管理和用量限制是使用前需要先看的部分。',
  'domain-network-security': '域名、DNS、CDN 和安全工具常常会影响真实线上服务。改配置前保留原记录，先测试再切换。',
  'project-collaboration': '项目工具的价值不在功能数量，而在团队是否愿意用同一套流程。先从一个项目和少量成员开始更容易判断。',
  'meeting-remote-work': '远程会议、排期、时区和远程桌面工具适合不同环节。重要会议前要测试设备，远程权限也应按需开启。',
  'document-pdf': '在线 PDF、文档编辑和电子签名工具能节省不少时间，但敏感材料是否适合上传，需要先看文件性质和处理方式。',
  'file-cloud-storage': '云盘、文件传输和格式转换各有侧重。共享前检查链接权限，重要资料同时保留独立备份。',
  'analytics-seo': '搜索、流量、性能和竞品数据来自不同来源。先弄清是后台实数、抽样数据还是第三方估算，再做判断。',
  'marketing-social': '邮件、社媒和广告工具可以提升协作效率，但不能替代内容和合规。订阅同意、账号权限和平台规则都要认真处理。',
  'ecommerce-customer-service': '这里覆盖独立站、支付、CRM 和客服工具。开户、费用和地区支持变化较快，实际使用以官网当前说明为准。'
};

function categoryPage(category) {
  const list = tools.filter((tool) => tool.categoryId === category.id);
  const body = `<main id="main">${breadcrumbs([{ name: '首页', url: '/' }, { name: category.name }])}<section class="category-head"><div class="container"><p class="eyebrow">${list.length} 个工具入口</p><h1>${esc(category.name)}工具导航</h1><p>${esc(categoryIntros[category.id])}</p>${searchBox()}</div></section><section class="content-section"><div class="container"><div class="section-heading"><div><h2>选择入口</h2><p>${esc(category.short)}</p></div></div><div class="tool-grid">${list.map(toolItem).join('')}</div></div></section>${promo(`category_${category.id}`)}<section class="content-section"><div class="container"><h2>怎么选更省时间</h2><div class="workflow-list">${categoryContent[category.id].tasks.slice(0, 5).map((task, index) => `<div class="workflow-link"><strong>${esc(task)}</strong><span>${esc(categoryContent[category.id].cautions[index % categoryContent[category.id].cautions.length])}</span></div>`).join('')}</div></div></section></main>`;
  const itemList = { '@type': 'ItemList', itemListElement: list.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.name, url: `${baseUrl}/tools/${tool.slug}/` })) };
  return htmlPage({ title: `${category.name}工具导航｜迈引导航`, description: `${categoryIntros[category.id]} 共整理 ${list.length} 个官方网站入口与中文介绍。`, canonical: `${baseUrl}/${category.path}/`, body, jsonLd: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${category.name}工具导航`, description: categoryIntros[category.id], url: `${baseUrl}/${category.path}/`, inLanguage: 'zh-CN' }, { '@context': 'https://schema.org', ...breadcrumbJson([{ name: '首页', url: '/' }, { name: category.name }]) }, { '@context': 'https://schema.org', ...itemList }] });
}

function toolPage(tool) {
  const content = categoryContent[tool.categoryId];
  const headings = headingSets[(tool.categoryIndex + categories.indexOf(tool.category)) % headingSets.length];
  const intro = introPatterns[(tool.categoryIndex + 2 * categories.indexOf(tool.category)) % introPatterns.length](tool, content);
  const start = startPatterns[(tool.categoryIndex + categories.indexOf(tool.category)) % startPatterns.length](tool);
  const decision = decisionPatterns[(tool.categoryIndex + 3 * categories.indexOf(tool.category)) % decisionPatterns.length](tool, content);
  const evaluation = evaluationSets[(tool.categoryIndex + categories.indexOf(tool.category)) % evaluationSets.length];
  const sameCategory = tools.filter((item) => item.categoryId === tool.categoryId && item.slug !== tool.slug);
  const related = [1, 4, 8, 12].map((offset) => sameCategory[(tool.categoryIndex + offset) % sameCategory.length]).filter(Boolean);
  const body = `<main id="main">${breadcrumbs([{ name: '首页', url: '/' }, { name: tool.category.name, url: `/${tool.category.path}/` }, { name: tool.name }])}<header class="article-head"><div class="container"><p class="eyebrow">${esc(tool.category.name)}</p><h1>${esc(tool.h1)}</h1><p>${esc(intro)}</p><div class="official-line"><a class="primary-button" href="${esc(tool.officialUrl)}" target="_blank" rel="noopener noreferrer external" data-tool-open data-tool-id="${tool.slug}" data-category-id="${tool.categoryId}">访问 ${esc(tool.name)} 官方网站 ↗</a><span class="official-domain">将打开 ${esc(tool.domain)}</span><button class="favorite-button" type="button" data-favorite-id="${tool.slug}" aria-pressed="false">☆ 收藏</button></div><p class="third-party-note">迈引导航提供中文介绍和入口链接，不代表该工具官方。</p></div></header><div class="container tool-main"><div class="article-layout"><article class="article-body"><section id="part-1"><h2>${esc(headings[0])}</h2><p>${esc(tool.purpose)}</p><p>判断 ${esc(tool.name)} 是否适合当前任务，可以先看这三点：</p><ul>${evaluation.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></section><section id="part-2"><h2>${esc(headings[1])}</h2><p>${esc(start)}</p><ol><li>先写清这次要完成的结果，不要同时尝试所有功能。</li><li>使用不含敏感信息的小样例跑完一次输入、处理和导出。</li><li>检查结果、权限和后续修改成本，再决定是否继续使用。</li></ol></section><section id="part-3"><h2>${esc(headings[2])}</h2><p>${esc(decision)}</p><p>${esc(content.cautions[(tool.categoryIndex + 3) % content.cautions.length])}。涉及正式发布、客户资料或付费决策时，多花几分钟确认通常更划算。</p></section>${promo(`tool_${tool.categoryId}`).replace('class="promo container"', 'class="promo"')}<section><h2>同类工具还可以这样比较</h2><p>如果 ${esc(tool.name)} 的操作方式不适合当前任务，可以看看下面这些同类入口。先比较任务匹配度，再看账号和费用。</p><div class="related-list">${related.map((item) => `<a href="/tools/${item.slug}/"><strong>${esc(item.name)}</strong><span>${esc(item.summary)}</span></a>`).join('')}</div></section></article><aside class="article-aside"><h2>本页内容</h2><ul><li><a href="#part-1">${esc(headings[0])}</a></li><li><a href="#part-2">${esc(headings[1])}</a></li><li><a href="#part-3">${esc(headings[2])}</a></li></ul><p><a href="/${tool.category.path}/">返回${esc(tool.category.name)}</a></p></aside></div></div></main>`;
  return htmlPage({ title: `${tool.title}｜迈引导航`, description: tool.description, canonical: `${baseUrl}/tools/${tool.slug}/`, body, jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: tool.h1, description: tool.description, url: `${baseUrl}/tools/${tool.slug}/`, inLanguage: 'zh-CN', isPartOf: { '@type': 'WebSite', name: '迈引导航', url: `${baseUrl}/` }, about: { '@type': 'Thing', name: tool.name } }, { '@context': 'https://schema.org', ...breadcrumbJson([{ name: '首页', url: '/' }, { name: tool.category.name, url: `/${tool.category.path}/` }, { name: tool.name }]) }] });
}

function plainPage(slug, title, description, content, current = '') {
  const body = `<main id="main">${breadcrumbs([{ name: '首页', url: '/' }, { name: title }])}<article class="container plain-page"><h1>${esc(title)}</h1>${content}</article></main>`;
  return htmlPage({ title: `${title}｜迈引导航`, description, canonical: `${baseUrl}/${slug}/`, current, body, jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: `${baseUrl}/${slug}/`, inLanguage: 'zh-CN' }, { '@context': 'https://schema.org', ...breadcrumbJson([{ name: '首页', url: '/' }, { name: title }]) }] });
}

fs.rmSync(dist, { recursive: true, force: true });
write('index.html', homePage());
write('tools/index.html', allToolsPage());
for (const category of categories) write(`${category.path}/index.html`, categoryPage(category));
for (const tool of tools) write(`tools/${tool.slug}/index.html`, toolPage(tool));

write('about/index.html', plainPage('about', '关于迈引导航', '了解迈引导航提供什么、如何使用工具入口，以及推广内容与普通链接的区别。', `<p>迈引导航面向需要跨境办公、内容创作、建站和出海运营的中文用户。你可以按任务浏览，也可以直接搜索工具名称。</p><section><h2>这里提供什么</h2><p>每个工具都有一页简短中文介绍，帮助你先判断用途和注意事项，再决定是否前往官方网站。本站不提供这些第三方服务，也不代替官方客服、合同或政策说明。</p></section><section><h2>推广内容</h2><p>虎跃加速横幅会明确标注“推广”，并与普通工具入口分开显示。普通工具的收录和页面顺序不代表商业排名。</p></section><section><h2>发现信息有误</h2><p>工具可能改名、迁移或调整功能。发现链接或介绍不准确时，可以通过 <a href="https://github.com/mayin-tools/mayin-tools.github.io/issues" target="_blank" rel="noopener noreferrer external">问题反馈页面</a> 告诉我们。</p></section>`, 'about'));
write('privacy/index.html', plainPage('privacy', '隐私政策', '迈引导航的访问统计、本地搜索、收藏功能和外部链接隐私说明。', `<p>迈引导航不要求注册账号。站内搜索在浏览器本地完成，搜索词不会作为统计参数发送。</p><section><h2>访问统计</h2><p>本站使用 Google Analytics 4 了解页面访问和固定按钮事件，Measurement ID 为 ${gaId}。统计服务可能处理设备、访问来源、粗略地区、会话信息和第一方 Cookie。本站不会主动把搜索词、收藏列表、完整外链地址或页面输入作为自定义事件发送。</p></section><section><h2>本地收藏</h2><p>收藏功能只把工具固定编号保存在当前浏览器的 localStorage 中，不上传服务器。清理浏览器网站数据后，收藏会同时被删除。</p></section><section><h2>外部网站</h2><p>点击官方网站或推广链接后，你将离开本站。第三方网站会按自己的隐私政策处理账号、文件和访问数据，请在提交内容前阅读相应说明。</p></section>`));
write('terms/index.html', plainPage('terms', '使用条款', '迈引导航第三方工具链接、内容参考范围和推广责任边界。', `<p>迈引导航提供第三方工具的中文介绍和入口链接，方便用户查找，不代表与这些工具的运营方存在隶属或授权关系。</p><section><h2>内容参考范围</h2><p>页面用于帮助你了解常见用途和使用提醒，不能替代工具官方说明、专业意见或合同文件。账号条件、功能、价格和地区支持以相应官方网站当时公布的内容为准。</p></section><section><h2>第三方服务</h2><p>你在第三方网站进行的注册、上传、购买、付款和其他操作，由你与该网站之间的条款约束。请自行判断服务是否适合，并妥善保护账号和资料。</p></section><section><h2>推广链接</h2><p>标注“推广”的横幅属于商业推广内容。点击前请自行了解产品信息，本站不对速度、价格、长期可用性或特定使用效果作保证。</p></section>`));

write('404.html', htmlPage({ title: '页面没有找到｜迈引导航', description: '你访问的页面不存在，可以返回首页搜索或浏览工具分类。', canonical: `${baseUrl}/404.html`, body: `<main id="main"><section class="page-intro"><div class="container"><p class="eyebrow">404</p><h1>这个页面没有找到</h1><p class="lead">链接可能已经变化。返回首页搜索工具，或浏览全部分类。</p><p><a class="primary-button" href="/">返回首页</a></p></div></section></main>` }));

const searchIndex = tools.map((tool) => ({ id: tool.slug, name: tool.name, category: tool.category.name, summary: tool.summary, url: `/tools/${tool.slug}/`, searchText: `${tool.name} ${tool.domain} ${tool.category.name} ${tool.summary}`.toLocaleLowerCase('zh-CN') }));
write('assets/search-index.json', `${JSON.stringify(searchIndex)}\n`);

fs.copyFileSync(path.join(root, 'src/assets/styles.css'), path.join(dist, 'assets/styles.css'));
fs.copyFileSync(path.join(root, 'src/assets/app.js'), path.join(dist, 'assets/app.js'));
for (const file of ['mayin-huyue-banner-desktop.png', 'mayin-huyue-banner-desktop.webp', 'mayin-huyue-banner-mobile.png', 'mayin-huyue-banner-mobile.webp']) fs.copyFileSync(path.join('/workspace/output', file), path.join(dist, 'assets', file));

write('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0f766e"/><path d="M18 44 44 18M27 18h17v17" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter"/></svg>`);
write('assets/og-cover.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f5f7f9"/><rect x="70" y="70" width="1060" height="490" fill="#fff" stroke="#d8dee7" stroke-width="2"/><path d="M130 205 245 90M170 90h75v75" fill="none" stroke="#c2410c" stroke-width="22"/><text x="130" y="330" fill="#17202a" font-size="92" font-family="Arial,Microsoft YaHei,sans-serif" font-weight="700">迈引导航</text><text x="130" y="425" fill="#5c6673" font-size="42" font-family="Arial,Microsoft YaHei,sans-serif">跨境办公与出海工具导航</text><text x="130" y="485" fill="#0f766e" font-size="28" font-family="Arial,Microsoft YaHei,sans-serif">300 个工具 · 15 个分类</text></svg>`);

write('site.webmanifest', JSON.stringify({ name: '迈引导航', short_name: '迈引导航', start_url: '/', display: 'standalone', background_color: '#f5f7f9', theme_color: '#0f766e', icons: [{ src: '/assets/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2));
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);

const publicUrls = ['/', '/tools/', ...categories.map((category) => `/${category.path}/`), ...tools.map((tool) => `/tools/${tool.slug}/`), '/about/', '/privacy/', '/terms/'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicUrls.map((url) => `  <url><loc>${baseUrl}${url}</loc><lastmod>2026-09-21</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('llms.txt', `# 迈引导航\n\n迈引导航是面向中文用户的跨境办公与出海工具导航。网站包含 15 个任务分类和 300 个第三方工具介绍页。\n\n- 首页：${baseUrl}/\n- 全部工具：${baseUrl}/tools/\n${categories.map((category) => `- ${category.name}：${baseUrl}/${category.path}/`).join('\n')}\n\n工具页提供用途、开始方式、限制和官方网站入口。迈引导航不是所列工具的官方网站。\n`);

console.log(`Built ${tools.length} tool pages, ${categories.length} category pages and ${publicUrls.length} indexable URLs.`);
