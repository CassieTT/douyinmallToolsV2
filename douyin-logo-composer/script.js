const ASSETS = {
  twoFront: {
    color: window.DOUYIN_LOGO_ASSETS?.twoFront?.color || "./assets/two-color.png",
    white: window.DOUYIN_LOGO_ASSETS?.twoFront?.white || "./assets/two-white.png",
  },
  twoBack: {
    color: window.DOUYIN_LOGO_ASSETS?.twoBack?.color || "./assets/two-back-color.png",
    white: window.DOUYIN_LOGO_ASSETS?.twoBack?.white || "./assets/two-back-white.png",
  },
  multi: {
    color: window.DOUYIN_LOGO_ASSETS?.multi?.color || "./assets/multi-color.png",
    white: window.DOUYIN_LOGO_ASSETS?.multi?.white || "./assets/multi-white.png",
  },
};

const EXPORT_SCALE = 4;
const BASE_HEIGHT = 82;
const TWO_GAP = 34;
const MULTI_GAP = 66;
const TWO_BACK_PLACEHOLDER_GAP = 16;
const MIN_OUTPUT_WIDTH = 760;

const state = {
  mode: "two",
  douyinPosition: "front",
  whiteMode: "auto",
  uploads: [],
  order: ["douyin"],
  nextUploadId: 1,
  uploadQueue: Promise.resolve(),
  logoScale: 1,
  offsetY: 0,
  padding: 56,
};

const els = {
  upload: document.querySelector("#logoUpload"),
  uploadHint: document.querySelector("#uploadHint"),
  whiteUpload: document.querySelector("#whiteLogoUpload"),
  whiteUploadWrap: document.querySelector("#whiteUploadWrap"),
  whiteUploadHint: document.querySelector("#whiteUploadHint"),
  positionField: document.querySelector("#positionField"),
  uploadOrderField: document.querySelector("#uploadOrderField"),
  uploadCount: document.querySelector("#uploadCount"),
  orderLabel: document.querySelector("#orderLabel"),
  logoList: document.querySelector("#logoList"),
  height: document.querySelector("#logoHeight"),
  heightValue: document.querySelector("#logoHeightValue"),
  offset: document.querySelector("#logoOffset"),
  offsetValue: document.querySelector("#logoOffsetValue"),
  padding: document.querySelector("#canvasPadding"),
  paddingValue: document.querySelector("#canvasPaddingValue"),
  colorShell: document.querySelector("#colorShell"),
  whiteShell: document.querySelector("#whiteShell"),
  colorStage: document.querySelector("#colorStage"),
  whiteStage: document.querySelector("#whiteStage"),
  colorCanvas: document.querySelector("#colorCanvas"),
  whiteCanvas: document.querySelector("#whiteCanvas"),
  downloadColor: document.querySelector("#downloadColor"),
  downloadWhite: document.querySelector("#downloadWhite"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  positionButtons: [...document.querySelectorAll("[data-douyin-position]")],
  whiteModeButtons: [...document.querySelectorAll("[data-white-mode]")],
};

const assetImages = {};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function loadAssets() {
  for (const mode of Object.keys(ASSETS)) {
    assetImages[mode] = {};
    for (const version of Object.keys(ASSETS[mode])) {
      assetImages[mode][version] = await loadImage(ASSETS[mode][version]);
    }
  }
}

function placeholderLogo(name, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 520;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#b8bec8";
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 144, 144);
  ctx.beginPath();
  ctx.moveTo(8, 8);
  ctx.lineTo(152, 152);
  ctx.moveTo(152, 8);
  ctx.lineTo(8, 152);
  ctx.stroke();
  ctx.fillStyle = "#111318";
  ctx.font = "700 78px Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(name || `LOGO ${index + 1}`, 178, 82);
  return {
    image: canvas,
    name: name || `LOGO ${index + 1}`,
    previewUrl: canvas.toDataURL("image/png"),
    placeholder: true,
  };
}

function getLogos() {
  if (state.uploads.length) {
    return state.mode === "two" ? state.uploads.slice(0, 1) : state.uploads;
  }
  return state.mode === "two"
    ? [placeholderLogo("LOGO", 0)]
    : [placeholderLogo("LOGO", 0), placeholderLogo("LOGO", 1)];
}

function logoMetrics(image) {
  const source = image.image || image;
  const targetHeight = Math.min(BASE_HEIGHT * state.logoScale, BASE_HEIGHT * 1.5);
  return {
    width: (source.width / source.height) * targetHeight,
    height: targetHeight,
  };
}

function getDouyinAsset(version) {
  if (state.mode === "two") {
    return assetImages[state.douyinPosition === "back" ? "twoBack" : "twoFront"][version];
  }
  return assetImages.multi[version];
}

function buildSegments(version) {
  const base = getDouyinAsset(version);
  const baseWidth = (base.width / base.height) * BASE_HEIGHT;
  const logos = getLogos();
  const metrics = logos.map(logoMetrics);
  const douyin = {
    type: "douyin",
    image: base,
    width: baseWidth,
    height: BASE_HEIGHT,
  };
  const partners = logos.map((logo, index) => ({
    key: logo.id ? `upload:${logo.id}` : `placeholder:${index}`,
    type: "partner",
    image: logo.image || logo,
    whiteImage: logo.whiteImage || null,
    width: metrics[index].width,
    height: metrics[index].height,
    placeholder: Boolean(logo.placeholder),
  }));
  if (state.mode === "multi" && state.uploads.length) {
    const partnerMap = new Map(partners.map((partner) => [partner.key, partner]));
    return getActiveOrder()
      .map((key) => (key === "douyin" ? douyin : partnerMap.get(key)))
      .filter(Boolean);
  }
  if (state.douyinPosition === "back") return [...partners, douyin];
  if (state.douyinPosition === "middle" && partners.length > 1) {
    const pivot = Math.ceil(partners.length / 2);
    return [...partners.slice(0, pivot), douyin, ...partners.slice(pivot)];
  }
  return [douyin, ...partners];
}

function layout(version) {
  const segments = buildSegments(version);
  const gaps = getSegmentGaps(segments);
  const contentWidth =
    segments.reduce((sum, item) => sum + item.width, 0) + gaps.reduce((sum, item) => sum + item, 0);
  const width = Math.max(MIN_OUTPUT_WIDTH, Math.ceil(contentWidth + state.padding * 2));
  const height = Math.ceil(Math.max(BASE_HEIGHT * 2.15, BASE_HEIGHT * state.logoScale + state.padding * 1.5));
  const startX = Math.max(state.padding, (width - contentWidth) / 2);
  return { segments, gaps, width, height, startX };
}

function getSegmentGaps(segments) {
  const defaultGap = state.mode === "two" ? TWO_GAP : MULTI_GAP;
  return segments.slice(1).map((segment, index) => {
    const previous = segments[index];
    if (
      state.mode === "two" &&
      state.douyinPosition === "back" &&
      previous.type === "partner" &&
      previous.placeholder &&
      segment.type === "douyin"
    ) {
      return TWO_BACK_PLACEHOLDER_GAP;
    }
    return defaultGap;
  });
}

function drawCanvas(canvas, version) {
  const spec = layout(version);
  canvas.width = spec.width * EXPORT_SCALE;
  canvas.height = spec.height * EXPORT_SCALE;
  canvas.dataset.previewWidth = spec.width;
  canvas.dataset.previewHeight = spec.height;
  canvas.style.width = `${spec.width}px`;
  canvas.style.height = `${spec.height}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0);
  ctx.clearRect(0, 0, spec.width, spec.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const centerY = spec.height / 2;
  let cursorX = spec.startX;
  spec.segments.forEach((item, index) => {
    if (index > 0) cursorX += spec.gaps[index - 1];
    if (item.type === "douyin") {
      ctx.drawImage(item.image, cursorX, centerY - item.height / 2, item.width, item.height);
    } else {
      drawPartnerLogo(ctx, item, cursorX, centerY - item.height / 2 + state.offsetY, item.width, item.height, version);
    }
    cursorX += item.width;
  });
}

function applyPreviewScale(shell, stage, canvas) {
  const naturalWidth = Number(canvas.dataset.previewWidth || 0);
  const naturalHeight = Number(canvas.dataset.previewHeight || 0);
  if (!naturalWidth || !naturalHeight) return;

  const styles = getComputedStyle(shell);
  const availableWidth =
    shell.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
  const availableHeight =
    shell.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
  const scale = Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight);
  const previewScale = Number.isFinite(scale) && scale > 0 ? scale : 1;

  stage.style.width = `${naturalWidth * previewScale}px`;
  stage.style.height = `${naturalHeight * previewScale}px`;
  canvas.style.transform = `scale(${previewScale})`;
}

function updatePreviewScales() {
  applyPreviewScale(els.colorShell, els.colorStage, els.colorCanvas);
  applyPreviewScale(els.whiteShell, els.whiteStage, els.whiteCanvas);
}

function drawPartnerLogo(ctx, item, x, y, width, height, version) {
  const logo = item.image || item;
  if (version === "white" && state.whiteMode === "upload" && item.whiteImage) {
    ctx.drawImage(item.whiteImage, x, y, width, height);
    return;
  }
  if (version === "white") {
    const mask = document.createElement("canvas");
    mask.width = Math.max(1, Math.ceil(width * EXPORT_SCALE));
    mask.height = Math.max(1, Math.ceil(height * EXPORT_SCALE));
    const maskCtx = mask.getContext("2d");
    maskCtx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0);
    maskCtx.drawImage(logo, 0, 0, width, height);
    maskCtx.globalCompositeOperation = "source-in";
    maskCtx.fillStyle = "#ffffff";
    maskCtx.fillRect(0, 0, width, height);
    ctx.drawImage(mask, x, y, width, height);
    return;
  }
  ctx.drawImage(logo, x, y, width, height);
}

function moveUpload(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= state.uploads.length) return;
  const [item] = state.uploads.splice(index, 1);
  state.uploads.splice(target, 0, item);
  render();
}

function removeUpload(index) {
  const [removed] = state.uploads.splice(index, 1);
  if (removed) state.order = state.order.filter((key) => key !== `upload:${removed.id}`);
  render();
}

function renderUploadOrder() {
  syncOrder();
  const visible = state.mode === "multi" || state.uploads.length > 0;
  els.uploadOrderField.hidden = !visible;
  els.orderLabel.textContent = state.mode === "multi" ? "呈现顺序" : "上传顺序";
  els.uploadCount.textContent = state.mode === "multi" ? `${getActiveOrder().length} 项` : `${state.uploads.length} 张`;
  const rows = state.mode === "multi" ? getOrderItems() : state.uploads.map((upload, index) => ({
    key: `upload:${upload.id}`,
    uploadIndex: index,
    name: upload.whiteImage ? `${upload.name} / 已配反白` : upload.name,
    previewUrl: upload.previewUrl,
    removable: true,
  }));

  els.logoList.replaceChildren(
    ...rows.map((item, index) => {
      const row = document.createElement("div");
      row.className = "logo-item";
      row.draggable = state.mode === "multi";
      row.dataset.orderKey = item.key;

      const thumb = document.createElement("div");
      thumb.className = "logo-thumb";
      const image = document.createElement("img");
      image.src = item.previewUrl;
      image.alt = "";
      thumb.append(image);

      const name = document.createElement("div");
      name.className = "logo-name";
      name.textContent = item.name;

      const tools = document.createElement("div");
      tools.className = "logo-tools";
      const up = document.createElement("button");
      up.type = "button";
      up.textContent = "↑";
      up.title = "上移";
      up.disabled = index === 0;
      up.addEventListener("click", () => moveOrderItem(index, -1));
      const down = document.createElement("button");
      down.type = "button";
      down.textContent = "↓";
      down.title = "下移";
      down.disabled = index === rows.length - 1;
      down.addEventListener("click", () => moveOrderItem(index, 1));
      tools.append(up, down);

      if (item.removable) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "×";
        remove.title = "移除";
        remove.addEventListener("click", () => removeUpload(item.uploadIndex));
        tools.append(remove);
      }

      row.addEventListener("dragstart", (event) => {
        if (state.mode !== "multi") return;
        row.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.key);
      });
      row.addEventListener("dragend", () => row.classList.remove("dragging"));
      row.addEventListener("dragover", (event) => {
        if (state.mode !== "multi") return;
        event.preventDefault();
        row.classList.add("drag-over");
      });
      row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
      row.addEventListener("drop", (event) => {
        row.classList.remove("drag-over");
        if (state.mode !== "multi") return;
        event.preventDefault();
        reorderByKeys(event.dataTransfer.getData("text/plain"), item.key);
      });

      row.append(thumb, name, tools);
      return row;
    })
  );
}

function getOrderItems() {
  const uploadMap = new Map(
    state.uploads.map((upload, index) => [
      `upload:${upload.id}`,
      {
        key: `upload:${upload.id}`,
        uploadIndex: index,
        name: upload.whiteImage ? `${upload.name} / 已配反白` : upload.name,
        previewUrl: upload.previewUrl,
        removable: true,
      },
    ])
  );
  return getActiveOrder()
    .map((key) =>
      key === "douyin"
        ? {
            key: "douyin",
            name: "抖音商城",
            previewUrl: douyinThumb(),
            removable: false,
          }
        : uploadMap.get(key)
    )
    .filter(Boolean);
}

function douyinThumb() {
  const image = assetImages.multi?.color || assetImages.twoFront?.color;
  if (!image) return "";
  const canvas = document.createElement("canvas");
  canvas.width = 120;
  canvas.height = 40;
  const ctx = canvas.getContext("2d");
  const width = (image.width / image.height) * 32;
  ctx.drawImage(image, 4, 4, width, 32);
  return canvas.toDataURL("image/png");
}

function syncOrder() {
  const uploadKeys = state.uploads.map((upload) => `upload:${upload.id}`);
  const valid = new Set(["douyin", ...uploadKeys]);
  state.order = state.order.filter((key) => valid.has(key));
  if (!state.order.includes("douyin")) state.order.unshift("douyin");
  uploadKeys.forEach((key) => {
    if (!state.order.includes(key)) state.order.push(key);
  });
}

function getActiveOrder() {
  syncOrder();
  return state.order;
}

function moveOrderItem(index, direction) {
  if (state.mode !== "multi") {
    moveUpload(index, direction);
    return;
  }
  const target = index + direction;
  if (target < 0 || target >= state.order.length) return;
  const [item] = state.order.splice(index, 1);
  state.order.splice(target, 0, item);
  render();
}

function reorderByKeys(sourceKey, targetKey) {
  if (!sourceKey || !targetKey || sourceKey === targetKey) return;
  const from = state.order.indexOf(sourceKey);
  const to = state.order.indexOf(targetKey);
  if (from < 0 || to < 0) return;
  const [item] = state.order.splice(from, 1);
  state.order.splice(to, 0, item);
  render();
}

function render() {
  if (!assetImages.twoFront || !assetImages.twoBack || !assetImages.multi) return;
  syncPositionOptions();
  syncWhiteModeOptions();
  els.heightValue.textContent = `${Math.round(state.logoScale * 100)}%`;
  els.offsetValue.textContent = `${state.offsetY}`;
  els.paddingValue.textContent = `${state.padding}`;
  els.upload.multiple = state.mode === "multi";
  els.whiteUpload.multiple = state.mode === "multi";
  els.uploadHint.textContent =
    state.mode === "two"
      ? "仅支持 PNG。双品牌模式会使用 1 张 logo。"
      : "仅支持 PNG。可多次选择文件追加上传。";
  els.whiteUploadHint.textContent =
    state.mode === "two"
      ? "上传 1 张反白 PNG。未上传时仍使用制作反白logo。"
      : "可上传多张反白 PNG，按品牌上传顺序依次对应。未上传的品牌仍使用制作反白logo。";
  renderUploadOrder();
  drawCanvas(els.colorCanvas, "color");
  drawCanvas(els.whiteCanvas, "white");
  requestAnimationFrame(updatePreviewScales);
}

function syncPositionOptions() {
  const allowMiddle = state.mode === "multi";
  els.positionField.hidden = state.mode === "multi";
  if (!allowMiddle && state.douyinPosition === "middle") {
    state.douyinPosition = "front";
  }
  els.positionButtons.forEach((button) => {
    const isMiddle = button.dataset.douyinPosition === "middle";
    button.hidden = isMiddle && !allowMiddle;
    button.classList.toggle("active", button.dataset.douyinPosition === state.douyinPosition);
  });
  const positionGroup = els.positionButtons[0]?.parentElement;
  if (positionGroup) positionGroup.style.setProperty("--segment-count", allowMiddle ? "3" : "2");
}

function syncWhiteModeOptions() {
  els.whiteUploadWrap.hidden = state.whiteMode !== "upload";
  els.whiteModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.whiteMode === state.whiteMode);
  });
}

function download(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function readUpload(file) {
  return new Promise((resolve, reject) => {
    if (file.type !== "image/png") {
      reject(new Error("只能上传 PNG 文件"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const normalized = normalizePngLogo(image);
        resolve({
          id: state.nextUploadId++,
          image: normalized.image,
          name: file.name,
          previewUrl: normalized.previewUrl,
        });
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function assignWhiteUploads(files, modeAtUpload) {
  const limit = modeAtUpload === "two" ? files.slice(0, 1) : files;
  const uploads = await Promise.all(limit.map(readUpload));
  const targetUploads = modeAtUpload === "two" ? state.uploads.slice(0, 1) : state.uploads;
  uploads.forEach((upload, index) => {
    if (targetUploads[index]) {
      targetUploads[index].whiteImage = upload.image;
      targetUploads[index].whitePreviewUrl = upload.previewUrl;
    }
  });
}

function normalizePngLogo(image) {
  const source = document.createElement("canvas");
  source.width = image.naturalWidth || image.width;
  source.height = image.naturalHeight || image.height;
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  sourceCtx.drawImage(image, 0, 0);

  const bounds = findAlphaBounds(sourceCtx, source.width, source.height);
  if (!bounds) {
    return { image, previewUrl: image.src };
  }

  const padding = Math.ceil(Math.max(bounds.width, bounds.height) * 0.02);
  const sx = Math.max(0, bounds.x - padding);
  const sy = Math.max(0, bounds.y - padding);
  const sw = Math.min(source.width - sx, bounds.width + padding * 2);
  const sh = Math.min(source.height - sy, bounds.height + padding * 2);

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  canvas.getContext("2d").drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);

  return {
    image: canvas,
    previewUrl: canvas.toDataURL("image/png"),
  };
}

function findAlphaBounds(ctx, width, height) {
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    els.modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    if (state.mode === "two") state.uploads = state.uploads.slice(0, 1);
    syncOrder();
    els.upload.value = "";
    render();
  });
});

els.positionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.douyinPosition = button.dataset.douyinPosition;
    els.positionButtons.forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

els.whiteModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.whiteMode = button.dataset.whiteMode;
    render();
  });
});

els.upload.addEventListener("change", (event) => {
  const files = [...event.target.files];
  if (!files.length) return;
  const modeAtUpload = state.mode;
  state.uploadQueue = state.uploadQueue
    .then(async () => {
      const limit = modeAtUpload === "two" ? files.slice(0, 1) : files;
      const uploads = await Promise.all(limit.map(readUpload));
      state.uploads = modeAtUpload === "two" ? uploads.slice(0, 1) : [...state.uploads, ...uploads];
      syncOrder();
      els.upload.value = "";
      render();
    })
    .catch((error) => {
      alert(error.message || "上传失败，请使用透明 PNG 文件。");
      els.upload.value = "";
    });
});

els.whiteUpload.addEventListener("change", (event) => {
  const files = [...event.target.files];
  if (!files.length) return;
  const modeAtUpload = state.mode;
  state.uploadQueue = state.uploadQueue
    .then(async () => {
      await assignWhiteUploads(files, modeAtUpload);
      els.whiteUpload.value = "";
      render();
    })
    .catch((error) => {
      alert(error.message || "反白 logo 上传失败，请使用 PNG 文件。");
      els.whiteUpload.value = "";
    });
});

els.height.addEventListener("input", () => {
  state.logoScale = Number(els.height.value) / 100;
  render();
});

els.offset.addEventListener("input", () => {
  state.offsetY = Number(els.offset.value);
  render();
});

els.padding.addEventListener("input", () => {
  state.padding = Number(els.padding.value);
  render();
});

els.downloadColor.addEventListener("click", () => {
  download(els.colorCanvas, `douyin-mall-${state.mode}-color@4x.png`);
});

els.downloadWhite.addEventListener("click", () => {
  download(els.whiteCanvas, `douyin-mall-${state.mode}-white@4x.png`);
});

window.addEventListener("resize", updatePreviewScales);

if ("ResizeObserver" in window) {
  const observer = new ResizeObserver(updatePreviewScales);
  observer.observe(els.colorShell);
  observer.observe(els.whiteShell);
}

loadAssets().then(render);
