# 抖音商城品牌海报生成工具

一个基于 HTML、CSS、JavaScript 和 Canvas 的浏览器端海报生成工具，支持竖版、横版、多比例品牌规范模板、图片上传裁切、搜索词编辑、角标开关与 PNG/JPG 导出。

## 本地预览

在当前目录运行：

```bash
python3 -m http.server 4181
```

然后打开：

```text
http://localhost:4181/
```

如果端口被占用，可以换成其他端口：

```bash
python3 -m http.server 8080
```

## 目录结构

```text
.
├── index.html
├── style.css
├── script.js
├── assets/
└── fonts/
```

## 主要能力

- 卡片式模板选择：社交媒体 / 线下宣传
- 社交媒体：抖音 9:16、小红书 3:4、横版 16:9
- 线下宣传：平面海报 1:1.5、公交站牌 1:2、长 banner 1:2.5、长 banner 1:4
- 带品牌区 / 无品牌区切换
- 浅色背景 / 深色背景无品牌区模板
- 渐变叠加开关
- 左上角角标开关
- 上传图片后拖拽、缩放、裁切
- 搜索词输入、校验与 Canvas 绘制
- PNG / JPG 高清导出

## 资源替换

品牌素材路径集中配置在 `script.js` 顶部的 `config` 中，例如：

- `brandAreaSvgPath`
- `brandAreaPngPath`
- `logoSloganPngPath`
- `searchBoxSvgPath`
- `cornerBadgePngPath`
- `horizontalAssets`
- `noBrandAssets`

字体文件在 `fonts/` 中，CSS 通过 `@font-face` 引入。
