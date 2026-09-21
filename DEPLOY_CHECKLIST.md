# 迈引导航上线检查清单

## 上传前

- [ ] `npm run prepare` 成功，工具数为 300。
- [ ] `npm run build` 成功。
- [ ] `npm run check` 全部通过。
- [ ] 桌面和移动截图没有文字重叠、横向溢出或横幅裁切。
- [ ] ZIP 解压后目录完整，`index.html` 位于根目录。

## GitHub Pages

- [ ] 上传的是 `dist/` 内文件，而不是多套一层目录。
- [ ] 首页 `https://mayin-tools.github.io/` 返回 200。
- [ ] 随机抽查至少 15 个分类页和 30 个工具页。
- [ ] `robots.txt`、`sitemap.xml`、`llms.txt` 和 404 可访问。
- [ ] 内部链接和静态资源均使用当前组织站根路径。

## 统计与推广

- [ ] 每页只加载一次 `G-EEKYMLMF2H`。
- [ ] GA4 实时报告能看到网页浏览。
- [ ] 官方工具按钮打开正确官方域名，不带 `sponsored`。
- [ ] 虎跃横幅打开 `https://huyuejsq.co/`，带 `sponsored noopener noreferrer`。
- [ ] 横幅与官方网站按钮保持明显距离，移动端不会误触。

## 收录

- [ ] Search Console 验证当前站点所有权。
- [ ] 提交 `https://mayin-tools.github.io/sitemap.xml`。
- [ ] 检查 canonical、页面标题和结构化数据与线上 URL 一致。
- [ ] 不把部署成功写成已收录；等待搜索引擎实际抓取结果。

## 统计与隐私

- 首次访问时确认“访问统计设置”提示正常出现。
- 点击“暂不启用”后刷新页面，Google Analytics 不应加载。
- 清理该站点的本地存储后重新访问，点击“同意统计”，再到 GA4 实时报告确认访问数据。
- 隐私政策应说明统计只在同意后加载，拒绝不影响搜索、收藏和浏览。
