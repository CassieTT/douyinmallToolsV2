const FONT_FAMILY = "Douyin Meihao Bold";
const DEFAULT_TEMPLATE_PATH = "./assets/svg/search-box-adaptive-template.svg";
const DEFAULT_FONT_PATH = "./assets/fonts/DouyinMeihaoBold.otf";
const LONG_TEMPLATE_PATH = "./assets/svg/search-box-long-template.svg";
const MAX_DEFAULT_LENGTH = 16;
const MAX_LONG_LENGTH = 22;
const ERROR_MESSAGE = "请输入中文、英文字母或数字，默认搜索框不超过 16 个字符，长版搜索框不超过 22 个字符";
const OVERFLOW_MESSAGE = "输入长度过长，请缩短搜索词";
const LONG_MODE_HINT = "已超过默认搜索框 16 个字符，请切换为长版搜索框。";
const AUTO_LONG_MODE_MESSAGE = "已为您自动切换为长版搜索框";

// 替换 AI 导出的 SVG 时，优先把整体搜索框高度和搜索词留白区域更新为这组 SVG 坐标。
const TEXT_FONT_SIZE = 65;
const TEXT_X_OFFSET = -15;
const TEXT_VISUAL_CENTER_OFFSET = 0;
const TEXT_TRACKING = 50;
const TEXT_LETTER_SPACING = `${TEXT_TRACKING / 1000}em`;

const SEARCH_BOX_MODES = {
  default: {
    id: "default",
    maxLength: MAX_DEFAULT_LENGTH,
    viewBox: "0 0 1173.75 138.09",
    contentArea: {
      x: 452,
      y: 31,
      width: 610,
      height: 76
    }
  },
  long: {
    id: "long",
    maxLength: MAX_LONG_LENGTH,
    viewBox: "0 0 1335.71 138.09",
    contentArea: {
      x: 452,
      y: 31,
      width: 760,
      height: 76
    }
  }
};

const state = {
  mode: "default",
  templateMarkup: "",
  fontCssUrl: DEFAULT_FONT_PATH,
  fontExportUrl: DEFAULT_FONT_PATH,
  fontBlobUrl: "",
  longTemplateMarkup: "",
  longTemplateMarkupPromise: null,
  defaultFontDataUrlPromise: null,
  isComposingPreviewText: false,
  lastFit: null
};

const els = {
  form: document.getElementById("searchForm"),
  searchText: document.getElementById("searchText"),
  ratioInput: document.getElementById("ratioInput"),
  fontPath: document.getElementById("fontPath"),
  templatePath: document.getElementById("templatePath"),
  fontUpload: document.getElementById("fontUpload"),
  templateUpload: document.getElementById("templateUpload"),
  reloadTemplate: document.getElementById("reloadTemplate"),
  errorMessage: document.getElementById("errorMessage"),
  modeSwitch: document.getElementById("modeSwitch"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  previewCanvas: document.getElementById("previewCanvas"),
  previewTextInput: document.getElementById("previewTextInput"),
  svg: document.getElementById("searchPreviewSvg"),
  templateLayer: document.getElementById("templateLayer"),
  contentArea: document.getElementById("searchContentArea"),
  textNode: document.getElementById("searchTextNode"),
  targetWidthValue: document.getElementById("targetWidthValue"),
  fontSizeValue: document.getElementById("fontSizeValue"),
  containerWidthValue: document.getElementById("containerWidthValue"),
  downloadSvg: document.getElementById("downloadSvg"),
  downloadPng: document.getElementById("downloadPng"),
  downloadJpg: document.getElementById("downloadJpg")
};

state.templateMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SEARCH_BOX_MODES.default.viewBox}">${els.templateLayer.innerHTML}</svg>`;

function validateSearchText(text) {
  const value = normalizeEditableText(text);
  if (!value.trim() || !/^[\u4e00-\u9fffA-Za-z0-9\s]+$/.test(value)) {
    return { ok: false, value, message: ERROR_MESSAGE };
  }

  const charLength = getSearchTextLength(value);
  if (charLength < 1 || charLength > MAX_LONG_LENGTH) return { ok: false, value, message: ERROR_MESSAGE, charLength };

  const mode = SEARCH_BOX_MODES[state.mode];
  if (charLength <= mode.maxLength) return { ok: true, value, type: "mixed", charLength };

  return { ok: false, value, message: LONG_MODE_HINT, charLength, canUseLongMode: charLength <= MAX_LONG_LENGTH };
}

function getSearchTextLength(text) {
  return Array.from(normalizeEditableText(text)).reduce((total, char) => total + (/[\u4e00-\u9fff]/.test(char) ? 2 : 1), 0);
}

function getCurrentMode() {
  return SEARCH_BOX_MODES[state.mode] || SEARCH_BOX_MODES.default;
}

function segmentSearchText(text) {
  const segments = [];
  let current = "";
  let currentType = "";

  for (const char of Array.from(text)) {
    const type = /[A-Za-z0-9\s]/.test(char) ? "latin" : "tracked";
    if (current && type !== currentType) {
      segments.push({ text: current, type: currentType });
      current = "";
    }
    current += char;
    currentType = type;
  }

  if (current) segments.push({ text: current, type: currentType });
  return segments;
}

function applyTextSegments(node, text) {
  node.replaceChildren();
  segmentSearchText(text).forEach((segment) => {
    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan.textContent = segment.text;
    tspan.setAttribute("letter-spacing", segment.type === "latin" ? "0" : TEXT_LETTER_SPACING);
    node.appendChild(tspan);
  });
}

function normalizeEditableText(text) {
  return text.replace(/\u00a0/g, " ").replace(/[\r\n]+/g, " ");
}

function toEditableText(text) {
  return text.replace(/ /g, "\u00a0");
}

function getEditableCaretOffset(root) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;

  const beforeCaret = range.cloneRange();
  beforeCaret.selectNodeContents(root);
  beforeCaret.setEnd(range.startContainer, range.startOffset);
  return beforeCaret.toString().length;
}

function setEditableCaretOffset(root, offset) {
  const selection = window.getSelection();
  if (!selection || offset === null) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let textNode = null;
  let textOffset = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (remaining <= node.textContent.length) {
      textNode = node;
      textOffset = remaining;
      break;
    }
    remaining -= node.textContent.length;
  }

  if (!textNode) {
    textNode = root.lastChild?.firstChild || root.firstChild;
    textOffset = textNode?.textContent.length || 0;
  }

  if (!textNode) return;
  const range = document.createRange();
  range.setStart(textNode, textOffset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function renderEditableSegments(text) {
  if (state.isComposingPreviewText) return;

  const wasFocused = document.activeElement === els.previewTextInput;
  const caretOffset = wasFocused ? getEditableCaretOffset(els.previewTextInput) : null;
  els.previewTextInput.replaceChildren();

  const segments = segmentSearchText(text);
  if (segments.length === 0) {
    els.previewTextInput.appendChild(document.createTextNode(""));
  } else {
    segments.forEach((segment) => {
      const span = document.createElement("span");
      span.textContent = toEditableText(segment.text);
      span.style.letterSpacing = segment.type === "latin" ? "0" : TEXT_LETTER_SPACING;
      els.previewTextInput.appendChild(span);
    });
  }

  if (wasFocused) setEditableCaretOffset(els.previewTextInput, caretOffset);
}

function syncPreviewInputLayout(fit) {
  const mode = getCurrentMode();
  const area = mode.contentArea;
  const size = getSvgViewBoxSize(els.svg);
  const scale = els.svg.getBoundingClientRect().width / size.width;

  els.previewTextInput.style.left = `${(area.x + TEXT_X_OFFSET) * scale}px`;
  els.previewTextInput.style.top = `${area.y * scale}px`;
  els.previewTextInput.style.width = `${area.width * scale}px`;
  els.previewTextInput.style.height = `${area.height * scale}px`;
  els.previewTextInput.style.fontSize = `${(fit?.fontSize || TEXT_FONT_SIZE) * scale}px`;
  els.previewTextInput.style.lineHeight = `${area.height * scale}px`;
}

function updateFontFace(url) {
  let style = document.getElementById("dynamicFontFace");
  if (!style) {
    style = document.createElement("style");
    style.id = "dynamicFontFace";
    document.head.appendChild(style);
  }

  style.textContent = `
    @font-face {
      font-family: "${FONT_FAMILY}";
      src: url("${url}");
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }
  `;
}

function createMeasureSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.style.visibility = "hidden";
  svg.style.overflow = "visible";

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("font-family", FONT_FAMILY);
  text.setAttribute("font-weight", "700");
  svg.appendChild(text);
  document.body.appendChild(svg);
  return { svg, text };
}

function measureSvgText(text, fontSize) {
  if (!measureSvgText.cache) measureSvgText.cache = createMeasureSvg();
  const node = measureSvgText.cache.text;
  applyTextSegments(node, text);
  node.setAttribute("font-size", String(fontSize));
  node.removeAttribute("letter-spacing");
  return node.getBBox().width;
}

function measureSvgTextBox(text, fontSize) {
  if (!measureSvgText.cache) measureSvgText.cache = createMeasureSvg();
  const node = measureSvgText.cache.text;
  applyTextSegments(node, text);
  node.setAttribute("font-size", String(fontSize));
  node.removeAttribute("letter-spacing");
  node.setAttribute("x", "0");
  node.setAttribute("y", "0");
  const box = node.getBBox();
  return { x: box.x, y: box.y, width: box.width, height: box.height };
}

function getBaselineY(text, fontSize, targetCenterY) {
  const box = measureSvgTextBox(text, fontSize);
  return targetCenterY - (box.y + box.height / 2);
}

function fitSearchText(text, containerWidth, ratio = 1.0) {
  const validation = validateSearchText(text);
  if (!validation.ok) {
    return { ok: false, message: validation.message, canUseLongMode: validation.canUseLongMode };
  }

  const maxWidth = containerWidth * ratio;
  const fixedFontSize = TEXT_FONT_SIZE;
  const fixedBox = measureSvgTextBox(validation.value, fixedFontSize);
  const isOverflow = fixedBox.width > maxWidth;

  return {
    ok: true,
    text: validation.value,
    type: validation.type,
    targetWidth: maxWidth,
    targetTextHeight: fixedFontSize,
    fontSize: fixedFontSize,
    isOverflow,
    message: isOverflow ? OVERFLOW_MESSAGE : "",
    fittedWidth: fixedBox.width,
    rawWidth: fixedBox.width,
    containerWidth
  };
}

function parseSvgTemplate(markup) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, "image/svg+xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error("SVG 模板解析失败");

  const sourceSvg = doc.querySelector("svg");
  if (!sourceSvg) throw new Error("文件中没有找到 SVG 根节点");

  const viewBox = sourceSvg.getAttribute("viewBox") || "0 0 1173.75 138.09";
  const inner = Array.from(sourceSvg.childNodes).map((node) => new XMLSerializer().serializeToString(node)).join("");
  return { viewBox, inner };
}

function applyTemplate(markup) {
  const parsed = parseSvgTemplate(markup);
  state.templateMarkup = markup;
  state.mode = "default";
  els.svg.setAttribute("viewBox", parsed.viewBox);
  els.templateLayer.innerHTML = parsed.inner;

  const area = getCurrentMode().contentArea;
  els.contentArea.setAttribute("x", area.x);
  els.contentArea.setAttribute("y", area.y);
  els.contentArea.setAttribute("width", area.width);
  els.contentArea.setAttribute("height", area.height);
  render();
}

async function loadLongTemplateMarkup() {
  if (state.longTemplateMarkup) return state.longTemplateMarkup;
  if (state.longTemplateMarkupPromise) return state.longTemplateMarkupPromise;

  state.longTemplateMarkupPromise = fetch(LONG_TEMPLATE_PATH)
    .then((response) => {
      if (!response.ok) throw new Error(`无法载入长版模板：${LONG_TEMPLATE_PATH}`);
      return response.text();
    })
    .then((markup) => {
      state.longTemplateMarkup = markup;
      return markup;
    });

  return state.longTemplateMarkupPromise;
}

async function applyLongTemplate() {
  const mode = SEARCH_BOX_MODES.long;
  const parsed = parseSvgTemplate(await loadLongTemplateMarkup());
  state.mode = "long";
  els.svg.setAttribute("viewBox", parsed.viewBox || mode.viewBox);
  els.templateLayer.innerHTML = parsed.inner;

  els.contentArea.setAttribute("x", mode.contentArea.x);
  els.contentArea.setAttribute("y", mode.contentArea.y);
  els.contentArea.setAttribute("width", mode.contentArea.width);
  els.contentArea.setAttribute("height", mode.contentArea.height);
  render();
}

function updateModeControls() {
  const charLength = getSearchTextLength(els.searchText.value);
  const showSwitch = charLength > MAX_DEFAULT_LENGTH;
  els.modeSwitch.hidden = !showSwitch;

  if (!showSwitch && state.mode !== "default") {
    applyTemplate(state.templateMarkup);
    return;
  }

  els.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
    button.setAttribute("aria-pressed", button.dataset.mode === state.mode ? "true" : "false");
  });
}

function setSearchBoxMode(mode) {
  if (mode === state.mode) return render();
  if (mode === "long") {
    applyLongTemplate().catch((error) => setError(error.message));
    return;
  }
  applyTemplate(state.templateMarkup);
}

function handleSearchTextChange() {
  const charLength = getSearchTextLength(els.searchText.value);
  if (charLength > MAX_DEFAULT_LENGTH && charLength <= MAX_LONG_LENGTH && state.mode === "default") {
    applyLongTemplate().catch((error) => setError(error.message));
    return;
  }
  render();
}

async function loadTemplateFromPath(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`无法载入模板：${path}`);
  const markup = await response.text();
  applyTemplate(markup);
}

function setError(message) {
  els.errorMessage.textContent = message || "";
  els.searchText.setAttribute("aria-invalid", message ? "true" : "false");
}

function getStatusMessage(fit) {
  const charLength = getSearchTextLength(els.searchText.value);
  if (charLength > MAX_LONG_LENGTH) return ERROR_MESSAGE;
  if (charLength > MAX_DEFAULT_LENGTH) {
    return state.mode === "long" ? AUTO_LONG_MODE_MESSAGE : LONG_MODE_HINT;
  }
  return fit?.message || "";
}

function updateMetrics(fit) {
  els.targetWidthValue.textContent = fit ? fit.targetWidth.toFixed(1) : "0";
  els.fontSizeValue.textContent = fit ? fit.fontSize.toFixed(1) : "0";
  els.containerWidthValue.textContent = fit ? fit.containerWidth.toFixed(1) : "0";
}

function setExportAvailability(isAvailable) {
  els.downloadSvg.disabled = !isAvailable;
  els.downloadPng.disabled = !isAvailable;
  els.downloadJpg.disabled = !isAvailable;
}

async function render() {
  await document.fonts.ready;

  updateModeControls();
  const ratio = Number.parseFloat(els.ratioInput.value) || 1.0;
  const area = getCurrentMode().contentArea;
  const fit = fitSearchText(els.searchText.value, area.width, ratio);
  state.lastFit = fit.ok && !fit.isOverflow ? fit : null;

  if (!fit.ok) {
    setError(getStatusMessage(fit));
    els.textNode.replaceChildren();
    renderEditableSegments(els.searchText.value);
    syncPreviewInputLayout(null);
    els.textNode.removeAttribute("transform");
    els.textNode.removeAttribute("dy");
    els.textNode.removeAttribute("dominant-baseline");
    updateMetrics(null);
    setExportAvailability(false);
    return;
  }

  setError(getStatusMessage(fit));
  applyTextSegments(els.textNode, fit.text);
  renderEditableSegments(fit.text);
  syncPreviewInputLayout(fit);
  els.textNode.setAttribute("x", area.x + area.width / 2 + TEXT_X_OFFSET);
  els.textNode.setAttribute("y", getBaselineY(fit.text, fit.fontSize, area.y + area.height / 2 + TEXT_VISUAL_CENTER_OFFSET).toFixed(3));
  els.textNode.setAttribute("font-family", FONT_FAMILY);
  els.textNode.setAttribute("font-size", fit.fontSize.toFixed(3));
  els.textNode.setAttribute("font-weight", "700");
  els.textNode.removeAttribute("letter-spacing");
  els.textNode.removeAttribute("dy");
  els.textNode.removeAttribute("dominant-baseline");
  els.textNode.removeAttribute("transform");
  updateMetrics(fit);
  setExportAvailability(!fit.isOverflow);
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function urlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`无法载入字体：${url}`);
  const blob = await response.blob();
  return readFileAsDataUrl(blob);
}

async function getExportFontUrl() {
  if (state.fontExportUrl === DEFAULT_FONT_PATH) {
    return loadDefaultFontDataUrl();
  }

  if (state.fontExportUrl.startsWith("data:")) return state.fontExportUrl;
  try {
    return await urlToDataUrl(state.fontExportUrl);
  } catch {
    return new URL(state.fontExportUrl, document.baseURI).href;
  }
}

async function loadDefaultFontDataUrl() {
  if (window.DOUYIN_MEIHAO_BOLD_DATA_URL) return window.DOUYIN_MEIHAO_BOLD_DATA_URL;
  if (state.defaultFontDataUrlPromise) return state.defaultFontDataUrlPromise;

  state.defaultFontDataUrlPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "./assets/fonts/douyin-meihao-bold-data-url.js";
    script.onload = () => {
      if (window.DOUYIN_MEIHAO_BOLD_DATA_URL) {
        resolve(window.DOUYIN_MEIHAO_BOLD_DATA_URL);
      } else {
        reject(new Error("字体数据载入失败"));
      }
    };
    script.onerror = () => reject(new Error("字体数据载入失败"));
    document.head.appendChild(script);
  });

  return state.defaultFontDataUrlPromise;
}

function getSvgViewBoxSize(svg) {
  const viewBox = svg.getAttribute("viewBox") || getCurrentMode().viewBox;
  const [, , width, height] = viewBox.split(/\s+/).map(Number);
  return {
    width: Number.isFinite(width) ? width : 1173.75,
    height: Number.isFinite(height) ? height : 138.09
  };
}

async function buildExportSvgString() {
  if (!state.lastFit) await render();
  if (!state.lastFit) throw new Error(els.errorMessage.textContent || ERROR_MESSAGE);

  const clone = els.svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.removeAttribute("class");
  clone.querySelector("#searchContentArea")?.remove();

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  const fontUrl = await getExportFontUrl();
  style.textContent = `
    @font-face {
      font-family: "${FONT_FAMILY}";
      src: url("${fontUrl}");
      font-weight: 700;
    }
    .search-text {
      fill: #000000;
      font-family: "${FONT_FAMILY}", "PingFang SC", "Microsoft YaHei", sans-serif;
      font-weight: 700;
    }
  `;
  defs.appendChild(style);
  clone.insertBefore(defs, clone.firstChild);

  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function downloadSvg() {
  try {
    const svg = await buildExportSvgString();
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `douyin-search-${els.searchText.value.trim()}.svg`);
  } catch (error) {
    setError(error.message || ERROR_MESSAGE);
  }
}

async function downloadRaster(format) {
  const isJpg = format === "jpg";
  try {
    const svg = await buildExportSvgString();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = "async";

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    const size = getSvgViewBoxSize(els.svg);
    canvas.width = Math.round(size.width * 2);
    canvas.height = Math.round(size.height * 2);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isJpg) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const mimeType = isJpg ? "image/jpeg" : "image/png";
    canvas.toBlob(
      (rasterBlob) => {
        if (rasterBlob) downloadBlob(rasterBlob, `douyin-search-${els.searchText.value.trim()}.${format}`);
      },
      mimeType,
      isJpg ? 0.95 : undefined
    );
  } catch (error) {
    setError(error.message || `${isJpg ? "JPG" : "PNG"} 导出失败`);
  }
}

function downloadPng() {
  return downloadRaster("png");
}

function downloadJpg() {
  return downloadRaster("jpg");
}

els.searchText.addEventListener("input", handleSearchTextChange);
els.ratioInput.addEventListener("input", render);
els.previewTextInput.addEventListener("compositionstart", () => {
  state.isComposingPreviewText = true;
});
els.previewTextInput.addEventListener("compositionend", () => {
  state.isComposingPreviewText = false;
  els.searchText.value = normalizeEditableText(els.previewTextInput.textContent);
  handleSearchTextChange();
});
els.previewTextInput.addEventListener("beforeinput", (event) => {
  if (state.isComposingPreviewText || event.isComposing) return;

  if (event.inputType === "insertParagraph" || event.inputType === "insertLineBreak") {
    event.preventDefault();
    return;
  }

  if (event.inputType === "insertText" && event.data === " ") {
    event.preventDefault();
    document.execCommand("insertText", false, "\u00a0");
  }
});
els.previewTextInput.addEventListener("keydown", (event) => {
  if (state.isComposingPreviewText || event.isComposing) return;
  if (event.key !== " " || event.metaKey || event.ctrlKey || event.altKey) return;
  event.preventDefault();
  document.execCommand("insertText", false, "\u00a0");
});
els.previewTextInput.addEventListener("paste", (event) => {
  event.preventDefault();
  const text = event.clipboardData?.getData("text/plain") || "";
  document.execCommand("insertText", false, toEditableText(text.replace(/[\r\n]+/g, " ")));
});
els.previewTextInput.addEventListener("input", () => {
  if (state.isComposingPreviewText) return;
  els.searchText.value = normalizeEditableText(els.previewTextInput.textContent);
  handleSearchTextChange();
});
window.addEventListener("resize", () => syncPreviewInputLayout(state.lastFit));
els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setSearchBoxMode(button.dataset.mode));
});

els.fontPath.addEventListener("change", async () => {
  const path = els.fontPath.value.trim() || DEFAULT_FONT_PATH;
  state.fontCssUrl = path;
  state.fontExportUrl = path;
  updateFontFace(path);
  await document.fonts.ready;
  render();
});

els.templatePath.addEventListener("change", () => loadTemplateFromPath(els.templatePath.value.trim() || DEFAULT_TEMPLATE_PATH).catch((error) => setError(error.message)));
els.reloadTemplate.addEventListener("click", () => loadTemplateFromPath(els.templatePath.value.trim() || DEFAULT_TEMPLATE_PATH).catch((error) => setError(error.message)));

els.fontUpload.addEventListener("change", async () => {
  const file = els.fontUpload.files?.[0];
  if (!file) return;

  if (state.fontBlobUrl) URL.revokeObjectURL(state.fontBlobUrl);
  state.fontBlobUrl = URL.createObjectURL(file);
  state.fontCssUrl = state.fontBlobUrl;
  state.fontExportUrl = await readFileAsDataUrl(file);
  updateFontFace(state.fontCssUrl);
  await document.fonts.ready;
  render();
});

els.templateUpload.addEventListener("change", async () => {
  const file = els.templateUpload.files?.[0];
  if (!file) return;

  try {
    const markup = await readFileAsText(file);
    applyTemplate(markup);
  } catch (error) {
    setError(error.message || "SVG 模板读取失败");
  }
});

els.downloadSvg.addEventListener("click", downloadSvg);
els.downloadPng.addEventListener("click", downloadPng);
els.downloadJpg.addEventListener("click", downloadJpg);

updateFontFace(DEFAULT_FONT_PATH);
loadTemplateFromPath(DEFAULT_TEMPLATE_PATH).catch((error) => {
  if (window.location.protocol !== "file:") setError(error.message);
  render();
});
