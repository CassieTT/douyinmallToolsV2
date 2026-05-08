# 抖音电商品牌资产搜索框自适应模板

一个纯 HTML/CSS/JavaScript 的搜索框素材生成工具。输入搜索词后，可实时预览并导出合并了搜索框模板、搜索词和内嵌字体的 SVG / PNG / JPG。

## 使用方式

直接打开 `index.html` 即可使用；也可以把整个文件夹上传到 GitHub 并开启 GitHub Pages。

## 当前参数

- 默认搜索词：品牌官方旗舰店
- 字体：`assets/fonts/DouyinMeihaoBold.otf`
- 导出字体：已通过 `assets/fonts/douyin-meihao-bold-data-url.js` 内嵌进 SVG
- 字号：65px
- 字间距：中文 tracking 50，即 `letter-spacing="0.05em"`；连续英文/数字片段为 0
- 最大宽度比例：1.0
- 默认搜索框长度上限：16 个字符宽度（中文计 2，英文/数字计 1）
- 长版搜索框长度上限：22 个字符宽度，超过 16 时显示切换提示
- 文字横向偏移：-15px
- 支持直接在预览区搜索框文字区域输入，并同步左侧搜索词输入框

## 目录结构

```text
douyin-search-box-tool/
  index.html
  style.css
  script.js
  assets/
    logo.png
    fonts/
      DouyinMeihaoBold.otf
      douyin-meihao-bold-data-url.js
    svg/
      search-box-adaptive-template.svg
      search-box-long-template.svg
```

## 说明

当前搜索框模板已内联在 `index.html` 中，导出的 SVG 是完整合并素材，不依赖外部模板文件。保留 `assets/svg/search-box-adaptive-template.svg` 是为了后续替换模板时方便维护。
