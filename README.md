# 迈引导航 v1.4.0

面向中文用户的跨境办公与出海工具导航。项目使用原生 HTML、CSS、JavaScript 和一个本地 Node 构建脚本，生成可直接部署到 GitHub Pages 的静态文件。

## 本地构建

需要 Node.js 20 或更高版本。社交分享图和推广图片已随源码提供，构建不依赖 Inkscape。

```bash
npm run prepare
npm run build
npm run check
```

构建结果位于 `dist/`。该目录包含首页、全部工具页、15 个分类页、300 个工具介绍页、政策页面、404、站点地图、搜索索引和全部本地资源。

## 本地预览

```bash
npm run preview
```

默认访问 `http://127.0.0.1:4173/`。搜索、收藏和绝对路径资源需要通过本地服务器预览，不建议直接双击 HTML 文件。

## GitHub Pages 部署

仓库目标为 `mayin-tools/mayin-tools.github.io`，Pages 根地址为 `https://mayin-tools.github.io/`。

1. 运行构建和检查命令。
2. 将 `dist/` 内的全部文件上传到仓库根目录，不要把 `dist` 文件夹本身再套一层。
3. 在 GitHub 仓库 Settings → Pages 中选择从默认分支根目录发布，或使用仓库已有的 Pages Actions 流程。
4. 等待部署完成后，分别检查首页、随机工具页、404、站点地图、横幅链接，以及同意访问统计后的 GA4 实时报告。

## 统计与推广

- GA4 Measurement ID：`G-EEKYMLMF2H`。默认不加载统计脚本，只有访客明确同意访问统计后才动态加载。
- 虎跃加速推广地址：`https://huyuejsq.co/`。
- 推广图片由本站托管，链接使用 `rel="sponsored noopener noreferrer"`。
- 普通官方网站链接不标记为推广。
- 搜索词、收藏列表和完整外链地址不会作为自定义统计参数发送；拒绝统计不影响站内搜索、收藏和工具浏览。

## 目录

- `src/data/`：分类、工具基础数据和中文内容底稿。
- `src/assets/`：共享样式与浏览器端脚本。
- `scripts/`：数据准备、静态构建、检查和本地预览。
- `dist/`：可直接部署的完整静态站点。
- `DEPLOY_CHECKLIST.md`：上传与线上验收清单。
