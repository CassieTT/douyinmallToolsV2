const posterCanvas = document.getElementById("posterCanvas");
const CANVAS_CONTEXT_OPTIONS = { colorSpace: "srgb" };

function get2dContext(canvas, options = {}) {
  try {
    return canvas.getContext("2d", { ...CANVAS_CONTEXT_OPTIONS, ...options }) || canvas.getContext("2d", options);
  } catch {
    return canvas.getContext("2d", options);
  }
}

const ctx = get2dContext(posterCanvas);

const templates = {
  vertical1080x1920: {
    name: "竖版 1080x1920",
    width: 1080,
    height: 1920,
    type: "vertical",
    brandHeight: 463.72,
    backgroundColor: "#ffffff"
  },
  vertical1080x1440: {
    name: "小红书 3:4",
    width: 1080,
    height: 1440,
    type: "vertical",
    brandHeight: 457.57,
    brandAssetKey: "xhs3x4",
    brandLayoutKey: "xhs3x4",
    backgroundColor: "#ffffff"
  },
  horizontal1920x1080: {
    name: "横版 1920x1080",
    width: 1920,
    height: 1080,
    type: "horizontal",
    brandHeight: 320,
    backgroundColor: "#ffffff"
  }
};

const horizontalTemplates = {
  h1x1_5: { name: "平面海报 1:1.5", width: 1620, height: 1080, type: "horizontal", assetKey: "h1x1_5", layout: "bottom" },
  h16x9: { name: "横版 16:9", width: 1920, height: 1080, type: "horizontal", assetKey: "h16x9", layout: "bottom" },
  h16x9_side: { name: "横版海报2", width: 1920, height: 1080, type: "horizontal", assetKey: "h1x2_5", layout: "side" },
  h1x2: { name: "公交站牌 1:2", width: 2160, height: 1080, type: "horizontal", assetKey: "h1x2", layout: "bottom" },
  h1x2_5: { name: "长banner1 1:2.5", width: 2700, height: 1080, type: "horizontal", assetKey: "h1x2_5", layout: "side" },
  h1x4: { name: "长banner2 1:4", width: 4320, height: 1080, type: "horizontal", assetKey: "h1x4", layout: "side" }
};

const templatePresets = {
  douyin9x16: { orientation: "vertical", templateKey: "vertical1080x1920" },
  xiaohongshu3x4: { orientation: "vertical", templateKey: "vertical1080x1440" },
  social16x9: { orientation: "horizontal", horizontalKey: "h16x9" },
  social16x9Side: { orientation: "horizontal", horizontalKey: "h16x9_side" },
  poster1x1_5: { orientation: "horizontal", horizontalKey: "h1x1_5" },
  bus1x2: { orientation: "horizontal", horizontalKey: "h1x2" },
  banner1x2_5: { orientation: "horizontal", horizontalKey: "h1x2_5" },
  banner1x4: { orientation: "horizontal", horizontalKey: "h1x4" }
};

const templateCategories = {
  social: ["douyin9x16", "xiaohongshu3x4", "social16x9", "social16x9Side"],
  offline: ["poster1x1_5", "bus1x2", "banner1x2_5", "banner1x4"]
};

const UNION_BASE_HEIGHT = 82;
const UNION_TWO_GAP = 34;
const UNION_MULTI_GAP = 66;
const UNION_TWO_BACK_PLACEHOLDER_GAP = 16;

const config = {
  templateKey: "vertical1080x1920",
  exportScale: 2,
  canvasBackground: "#ffffff",
  // 替换正式品牌区 SVG 时修改这里。建议放在项目内，避免 Canvas 导出跨域污染。
  brandAreaSvgPath: "./assets/svg/brand-area-bottom.svg",
  // 替换正式品牌区 PNG 时修改这里。若不为空，将优先绘制 PNG。
  brandAreaPngPath: "",
  brandWaistPngPath: "./assets/brand-waist.png",
  brandWaistRightPngPath: "./assets/brand-waist-right.png",
  brandGradientRectSvgPath: "./assets/svg/brand-gradient-rect.svg",
  adjustableBrandArea: {
    templateKeys: ["vertical1080x1920"],
    sideTemplateKeys: ["h16x9_side", "h1x2_5", "h1x4"],
    minRatio: 0.24,
    maxRatio: 0.4,
    sideMinRatio: 0.22,
    sideMinRatioByKey: {
      h16x9_side: 0.38,
      h1x2_5: 0.27,
      h1x4: 0.22
    },
    sideMaxRatioByKey: {
      h16x9_side: 0.5
    },
    sideMaxRatio: 0.4,
    sideContentOffsetXByKey: {
      h16x9_side: 36,
      h1x2_5: 36,
      h1x4: 42
    },
    sideContentEndOffsetXByKey: {
      h16x9_side: 34,
      h1x2_5: 34,
      h1x4: 34
    },
    waistSourceWidth: 2161,
    waistSourceHeight: 494,
    sideWaistSourceWidth: 374,
    sideWaistSourceHeight: 1148,
    gradientSourceWidth: 107.99,
    gradientSourceHeight: 49.57,
    solidRectOverlap: 60,
    defaultContentOffsetY: -9,
    logoSearchGap: 23.06
  },
  verticalBrandAssets: {
    xhs3x4: {
      path: "./assets/brand-area-3x4.png",
      sourceWidth: 2896,
      sourceHeight: 1227
    }
  },
  logoSloganPngPath: "./assets/logo-slogan.png",
  logoSloganSvgPath: "",
  searchBoxSvgPath: "./assets/svg/search-box-brand.svg",
  searchBoxLongSvgPath: "./assets/svg/search-box-long-template.svg",
  cornerBadgePngPath: "./assets/corner-badge.png",
  noBrandAssets: {
    lightGradientPath: "./assets/no-brand-light-gradient.png",
    darkGradientPath: "./assets/no-brand-dark-gradient.png",
    lightLogoSloganPath: "./assets/no-brand-light-logo-slogan.png",
    darkLogoSloganPath: "./assets/no-brand-dark-logo-slogan.png"
  },
  horizontalAssets: {
    logoPath: "./assets/h-logo.png",
    sloganPath: "./assets/h-slogan.png",
    logoSloganPath: "./assets/h-logo-slogan.png",
    brandPaths: {
      h1x1_5: "./assets/h-brand-1-1-5.png",
      h16x9: "./assets/h-brand-16-9.png",
      h1x2: "./assets/h-brand-1-2.png",
      h1x2_5: "./assets/h-brand-1-2-5.png",
      h1x4: "./assets/h-brand-1-4.png"
    },
    brandSources: {
      h1x1_5: { width: 3261, height: 441 },
      h16x9: { width: 3886, height: 526 },
      h1x2: { width: 4510, height: 610 },
      h1x2_5: { width: 1435, height: 2161 },
      h1x4: { width: 1743, height: 2161 }
    }
  },
  unionLogoAssets: {
    twoFront: {
      color: "./douyin-logo-composer/assets/two-color.png",
      white: "./douyin-logo-composer/assets/two-white.png"
    },
    twoBack: {
      color: "./douyin-logo-composer/assets/two-back-color.png",
      white: "./douyin-logo-composer/assets/two-back-white.png"
    },
    multi: {
      color: "./douyin-logo-composer/assets/multi-color.png",
      white: "./douyin-logo-composer/assets/multi-white.png"
    }
  },
  unionSloganAssets: {
    colorPath: "./assets/union-slogan-color.png",
    whitePath: "./assets/union-slogan-white.png",
    colorSourceWidth: 840,
    colorSourceHeight: 137,
    whiteSourceWidth: 840,
    whiteSourceHeight: 136
  },
  unionLogoStack: {
    visualOffsetX: 10,
    offsetY: -5,
    logoOffsetY: -10,
    sloganOffsetY: 4,
    sloganHeightDelta: 2
  },
  brandLayout: {
    brandAreaSourceWidth: 1080,
    brandAreaSourceHeight: 463.72,
    assetScale: 1,
    logoSloganWidth: 434,
    logoSloganSourceWidth: 869,
    logoSloganSourceHeight: 366,
    logoSloganY: 1598,
    searchBoxWidth: 454.12,
    searchBoxSourceWidth: 454.12,
    searchBoxSourceHeight: 53.43,
    searchBoxY: 1804
  },
  verticalBrandLayoutOverrides: {
    xhs3x4: {
      brandAreaSourceWidth: 2896,
      brandAreaSourceHeight: 1227,
      logoSloganY: 1118,
      searchBoxY: 1324
    }
  },
  noBrandLayout: {
    yOffset: -80,
    logoSloganWidth: 420,
    logoSloganY: 1518,
    searchBoxWidth: 454.12,
    searchBoxY: 1724,
    gradientWidth: 1080,
    lightGradientSourceWidth: 2144,
    lightGradientSourceHeight: 1139,
    darkGradientSourceWidth: 2161,
    darkGradientSourceHeight: 870,
    lightLogoSourceWidth: 840,
    lightLogoSourceHeight: 354,
    darkLogoSourceWidth: 841,
    darkLogoSourceHeight: 354
  },
  horizontalLayout: {
    logoSourceWidth: 570,
    logoSourceHeight: 150,
    sloganSourceWidth: 729,
    sloganSourceHeight: 120,
    logoSloganSourceWidth: 975,
    logoSloganSourceHeight: 411,
    bottom: {
      baseWidth: 1920,
      logoWidth: 284,
      logoX: 57,
      logoCenterYRatio: 0.62,
      logoOffsetY: 10,
      sloganWidth: 364,
      sloganRight: 68,
      searchWidth: 386,
      searchRight: 66,
      searchBottom: 36,
      sloganSearchGap: 14
    },
    side: {
      panelWidthRatio: 0.22,
      logoSloganWidthRatio: 0.12,
      logoSloganCenterYRatio: 0.42,
      searchWidthRatio: 0.12,
      searchCenterYRatio: 0.62
    },
    overrides: {
      h1x1_5: {
        sloganWidth: 306,
        sloganRight: 60,
        searchWidth: 324,
        searchRight: 56,
        searchBottom: 30,
        sloganSearchGap: 12
      },
      h1x2: {
        sloganWidth: 422,
        sloganRight: 82,
        searchWidth: 448,
        searchRight: 78,
        searchBottom: 40,
        sloganSearchGap: 20
      },
      h1x2_5: {
        logoSloganWidth: 486,
        logoSloganRight: 60,
        searchWidth: 510,
        searchRight: 58,
        searchBottom: 392,
        logoSearchGap: 38
      },
      h16x9_side: {
        logoSloganWidth: 486,
        logoSloganRight: 60,
        searchWidth: 510,
        searchRight: 58,
        searchBottom: 392,
        logoSearchGap: 38
      },
      h1x4: {
        logoSloganWidth: 586,
        logoSloganRight: 98,
        searchWidth: 612,
        searchRight: 96,
        searchBottom: 362,
        logoSearchGap: 40
      }
    }
  },
  searchBar: {
    modeThreshold: 16,
    maxWeightedLength: 22,
    contentX: 176,
    contentY: 12,
    contentWidth: 236,
    contentHeight: 29.5,
    maxWidthRatio: 1,
    fixedFontSize: 24,
    fontFamily: "DouyinSansBold",
    textColor: "#161823",
    letterSpacing: 50 / 1000,
    textOffsetX: -7
  },
  searchBarLong: {
    sourceWidth: 516.76,
    sourceHeight: 53.43,
    contentX: 175,
    contentY: 12,
    contentWidth: 294,
    contentHeight: 29.5,
    maxWidthRatio: 1,
    fixedFontSize: 24,
    fontFamily: "DouyinSansBold",
    textColor: "#161823",
    letterSpacing: 50 / 1000,
    textOffsetX: -7
  },
  cornerBadge: {
    x: 0,
    y: 0,
    verticalWidthRatio: 310 / 1080,
    horizontalWidthRatio: 310 / 1920,
    horizontalWidthOverrides: {
      h1x4: 520
    },
    sourceWidth: 601,
    sourceHeight: 311
  }
};

const imageState = {
  scale: 1,
  offsetX: 0,
  offsetY: 0
};

const state = {
  template: templates.vertical1080x1920,
  userImage: null,
  brandSvgImage: null,
  brandPngImage: null,
  brandWaistImage: null,
  brandWaistRightImage: null,
  brandGradientRectImage: null,
  verticalBrandImages: {},
  logoSloganImage: null,
  searchBoxImage: null,
  cornerBadgeImage: null,
  noBrandLightGradientImage: null,
  noBrandDarkGradientImage: null,
  noBrandLightLogoSloganImage: null,
  noBrandDarkLogoSloganImage: null,
  horizontalLogoImage: null,
  horizontalSloganImage: null,
  horizontalLogoSloganImage: null,
  horizontalBrandImages: {},
  searchBoxLongImage: null,
  unionLogoBaseImages: {},
  unionSloganColorImage: null,
  unionSloganWhiteImage: null,
  logoScene: "single",
  unionMode: "two",
  unionDouyinPosition: "front",
  unionWhiteMode: "auto",
  unionUploads: [],
  unionOrder: ["douyin"],
  nextUnionUploadId: 1,
  unionUploadQueue: Promise.resolve(),
  unionLogoScale: 1,
  brandElementScale: 1,
  brandElementOffsetX: 0,
  brandElementOffsetY: 0,
  orientation: "vertical",
  templateKey: "vertical1080x1920",
  templatePreset: "douyin9x16",
  templateCategory: "social",
  brandHeightRatio: 0.24,
  horizontalKey: "h16x9",
  posterMode: "brand",
  noBrandTheme: "light",
  showNoBrandGradient: true,
  showCornerBadge: true,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragOffsetX: 0,
  dragOffsetY: 0,
  searchText: "",
  lastValidation: { ok: true, value: "" }
};

const els = {
  imageUpload: document.getElementById("imageUpload"),
  searchText: document.getElementById("searchText"),
  searchError: document.getElementById("searchError"),
  noBrandOptions: document.getElementById("noBrandOptions"),
  brandHeightOptions: document.getElementById("brandHeightOptions"),
  brandHeightRatio: document.getElementById("brandHeightRatio"),
  brandHeightRatioValue: document.getElementById("brandHeightRatioValue"),
  brandElementScale: document.getElementById("brandElementScale"),
  brandElementScaleValue: document.getElementById("brandElementScaleValue"),
  brandElementOffsetX: document.getElementById("brandElementOffsetX"),
  brandElementOffsetXValue: document.getElementById("brandElementOffsetXValue"),
  brandElementOffsetY: document.getElementById("brandElementOffsetY"),
  brandElementOffsetYValue: document.getElementById("brandElementOffsetYValue"),
  resetBrandElements: document.getElementById("resetBrandElements"),
  gradientToggle: document.getElementById("gradientToggle"),
  badgeToggle: document.getElementById("badgeToggle"),
  imageScale: document.getElementById("imageScale"),
  imageScaleValue: document.getElementById("imageScaleValue"),
  offsetX: document.getElementById("offsetX"),
  offsetY: document.getElementById("offsetY"),
  autoCenter: document.getElementById("autoCenter"),
  resetImage: document.getElementById("resetImage"),
  downloadPng: document.getElementById("downloadPng"),
  downloadJpg: document.getElementById("downloadJpg"),
  uploadStatus: document.getElementById("uploadStatus"),
  unionLogoOptions: document.getElementById("unionLogoOptions"),
  unionPositionField: document.getElementById("unionPositionField"),
  unionLogoUpload: document.getElementById("unionLogoUpload"),
  unionWhiteLogoUpload: document.getElementById("unionWhiteLogoUpload"),
  unionWhiteUploadWrap: document.getElementById("unionWhiteUploadWrap"),
  unionOrderField: document.getElementById("unionOrderField"),
  unionOrderLabel: document.getElementById("unionOrderLabel"),
  unionUploadCount: document.getElementById("unionUploadCount"),
  unionLogoList: document.getElementById("unionLogoList"),
  unionLogoScale: document.getElementById("unionLogoScale"),
  unionLogoScaleValue: document.getElementById("unionLogoScaleValue"),
  previewSearchInput: document.getElementById("previewSearchInput")
};

class SearchBarRenderer {
  constructor(options) {
    this.options = options;
  }

  draw(ctx, text, searchLayout) {
    drawSearchBar(ctx, text, searchLayout, this.options);
  }
}

const searchBarRenderer = new SearchBarRenderer(config.searchBar);

function getWeightedSearchLength(text) {
  return Array.from(text.trim()).reduce((total, char) => total + (/[\u4e00-\u9fff]/.test(char) ? 2 : 1), 0);
}

function getSearchBarModeForText(text) {
  return getWeightedSearchLength(text) > config.searchBar.modeThreshold ? "long" : "default";
}

function getSearchBarOptionsForMode(mode) {
  return mode === "long" ? config.searchBarLong : config.searchBar;
}

function getSearchBarSourceWidth(mode) {
  return mode === "long" ? config.searchBarLong.sourceWidth : config.brandLayout.searchBoxSourceWidth;
}

function getSearchBarSourceHeight(mode) {
  return mode === "long" ? config.searchBarLong.sourceHeight : config.brandLayout.searchBoxSourceHeight;
}

function getSearchBarWidthForMode(baseWidth, mode) {
  return mode === "long"
    ? baseWidth * (config.searchBarLong.sourceWidth / config.brandLayout.searchBoxSourceWidth)
    : baseWidth;
}

function resolveAssetSrc(src) {
  if (!src) return src;
  return window.LOCAL_ASSET_DATA?.[src] || src;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = resolveAssetSrc(src);
  });
}

async function loadBrandAssets() {
  const tasks = [];
  if (config.brandAreaSvgPath) {
    tasks.push(loadImage(config.brandAreaSvgPath).then((image) => (state.brandSvgImage = image)).catch(() => null));
  }
  if (config.brandAreaPngPath) {
    tasks.push(loadImage(config.brandAreaPngPath).then((image) => (state.brandPngImage = image)).catch(() => null));
  }
  tasks.push(loadImage(config.brandWaistPngPath).then((image) => (state.brandWaistImage = image)).catch(() => null));
  tasks.push(loadImage(config.brandWaistRightPngPath).then((image) => (state.brandWaistRightImage = image)).catch(() => null));
  tasks.push(loadImage(config.brandGradientRectSvgPath).then((image) => (state.brandGradientRectImage = image)).catch(() => null));
  if (config.logoSloganPngPath) {
    tasks.push(loadImage(config.logoSloganPngPath).then((image) => (state.logoSloganImage = image)).catch(() => null));
  }
  if (config.logoSloganSvgPath) {
    tasks.push(loadImage(config.logoSloganSvgPath).then((image) => (state.logoSloganImage = image)).catch(() => null));
  }
  if (config.searchBoxSvgPath) {
    tasks.push(loadImage(config.searchBoxSvgPath).then((image) => (state.searchBoxImage = image)).catch(() => null));
  }
  if (config.searchBoxLongSvgPath) {
    tasks.push(loadImage(config.searchBoxLongSvgPath).then((image) => (state.searchBoxLongImage = image)).catch(() => null));
  }
  if (config.cornerBadgePngPath) {
    tasks.push(loadImage(config.cornerBadgePngPath).then((image) => (state.cornerBadgeImage = image)).catch(() => null));
  }
  tasks.push(loadImage(config.noBrandAssets.lightGradientPath).then((image) => (state.noBrandLightGradientImage = image)).catch(() => null));
  tasks.push(loadImage(config.noBrandAssets.darkGradientPath).then((image) => (state.noBrandDarkGradientImage = image)).catch(() => null));
  tasks.push(loadImage(config.noBrandAssets.lightLogoSloganPath).then((image) => (state.noBrandLightLogoSloganImage = image)).catch(() => null));
  tasks.push(loadImage(config.noBrandAssets.darkLogoSloganPath).then((image) => (state.noBrandDarkLogoSloganImage = image)).catch(() => null));
  tasks.push(loadImage(config.horizontalAssets.logoPath).then((image) => (state.horizontalLogoImage = image)).catch(() => null));
  tasks.push(loadImage(config.horizontalAssets.sloganPath).then((image) => (state.horizontalSloganImage = image)).catch(() => null));
  tasks.push(loadImage(config.horizontalAssets.logoSloganPath).then((image) => (state.horizontalLogoSloganImage = image)).catch(() => null));
  Object.entries(config.horizontalAssets.brandPaths).forEach(([key, path]) => {
    tasks.push(loadImage(path).then((image) => (state.horizontalBrandImages[key] = image)).catch(() => null));
  });
  Object.entries(config.verticalBrandAssets).forEach(([key, asset]) => {
    tasks.push(loadImage(asset.path).then((image) => (state.verticalBrandImages[key] = image)).catch(() => null));
  });
  Object.entries(config.unionLogoAssets).forEach(([mode, versions]) => {
    state.unionLogoBaseImages[mode] = {};
    Object.entries(versions).forEach(([version, path]) => {
      tasks.push(loadImage(path).then((image) => (state.unionLogoBaseImages[mode][version] = image)).catch(() => null));
    });
  });
  tasks.push(loadImage(config.unionSloganAssets.colorPath).then((image) => (state.unionSloganColorImage = image)).catch(() => null));
  tasks.push(loadImage(config.unionSloganAssets.whitePath).then((image) => (state.unionSloganWhiteImage = image)).catch(() => null));
  await Promise.all(tasks);
  drawPoster();
}

function loadUserImage(file) {
  if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return;

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      state.userImage = image;
      resetImageState();
      els.uploadStatus.textContent = `${image.naturalWidth} × ${image.naturalHeight}`;
      drawPoster();
    };
    image.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

function getLayout() {
  const { width, height } = state.template;
  if (state.orientation === "horizontal") {
    return {
      width,
      height,
      main: { x: 0, y: 0, width, height },
      brand: { x: 0, y: 0, width, height }
    };
  }

  const brandHeight = getActiveBrandHeight();
  const brandY = height - brandHeight;
  return {
    width,
    height,
    main: { x: 0, y: 0, width, height },
    brand: { x: 0, y: brandY, width, height: brandHeight }
  };
}

function isAdjustableBrandAreaActive() {
  return state.orientation === "vertical" &&
    state.posterMode === "brand" &&
    config.adjustableBrandArea.templateKeys.includes(state.templateKey);
}

function isAdjustableSideBrandAreaActive() {
  return state.orientation === "horizontal" &&
    config.adjustableBrandArea.sideTemplateKeys.includes(state.horizontalKey);
}

function getActiveSideBrandMinRatio() {
  const settings = config.adjustableBrandArea;
  return settings.sideMinRatioByKey?.[state.horizontalKey] || settings.sideMinRatio;
}

function getActiveSideBrandMaxRatio() {
  const settings = config.adjustableBrandArea;
  return settings.sideMaxRatioByKey?.[state.horizontalKey] || settings.sideMaxRatio;
}

function getActiveSideContentOffsetX() {
  if (!isAdjustableSideBrandAreaActive()) return 0;
  const settings = config.adjustableBrandArea;
  const baseOffset = settings.sideContentOffsetXByKey?.[state.horizontalKey] || 0;
  const endOffset = settings.sideContentEndOffsetXByKey?.[state.horizontalKey] || 0;
  const min = getActiveSideBrandMinRatio();
  const max = getActiveSideBrandMaxRatio();
  const progress = max > min
    ? Math.min(1, Math.max(0, (state.brandHeightRatio - min) / (max - min)))
    : 1;
  return endOffset + (baseOffset - endOffset) * (1 - progress);
}

function getActiveBrandHeight() {
  if (!isAdjustableBrandAreaActive()) return state.template.brandHeight;
  return state.template.height * state.brandHeightRatio;
}

function getActiveSideBrandWidth(layoutWidth) {
  const minRatio = getActiveSideBrandMinRatio();
  const minWidth = layoutWidth * minRatio;
  if (!isAdjustableSideBrandAreaActive()) return minWidth;
  return Math.max(minWidth, layoutWidth * state.brandHeightRatio);
}

function transformRect(rect, bounds) {
  const scale = state.brandElementScale;
  if (!bounds || scale === 1 && state.brandElementOffsetX === 0 && state.brandElementOffsetY === 0) return rect;
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  return {
    x: centerX + state.brandElementOffsetX + (rect.x - centerX) * scale,
    y: centerY + state.brandElementOffsetY + (rect.y - centerY) * scale,
    width: rect.width * scale,
    height: rect.height * scale
  };
}

function applyBrandElementTransform(ctx, bounds) {
  if (!bounds) return;
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  ctx.translate(centerX + state.brandElementOffsetX, centerY + state.brandElementOffsetY);
  ctx.scale(state.brandElementScale, state.brandElementScale);
  ctx.translate(-centerX, -centerY);
}

function drawPoster() {
  const layout = getLayout();
  posterCanvas.width = layout.width;
  posterCanvas.height = layout.height;
  posterCanvas.style.aspectRatio = `${layout.width} / ${layout.height}`;
  posterCanvas.classList.toggle("horizontal-preview", state.orientation === "horizontal");
  document.querySelector(".preview-meta p").textContent = `${layout.width} × ${layout.height} px`;
  document.querySelector(".preview-meta strong").textContent = state.template.name || "竖版模板";
  els.uploadStatus.textContent = state.userImage
    ? `${state.userImage.naturalWidth} × ${state.userImage.naturalHeight}`
    : `${layout.width} × ${layout.height}`;

  renderPoster(ctx);
  syncPreviewSearchInput();
}

function renderPoster(targetCtx, scale = 1) {
  const layout = getLayout();
  targetCtx.save();
  targetCtx.setTransform(scale, 0, 0, scale, 0, 0);
  targetCtx.globalAlpha = 1;
  targetCtx.globalCompositeOperation = "source-over";
  targetCtx.filter = "none";
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = "high";
  targetCtx.clearRect(0, 0, layout.width, layout.height);
  targetCtx.fillStyle = config.canvasBackground;
  targetCtx.fillRect(0, 0, layout.width, layout.height);
  drawMainImage(targetCtx, layout.main);

  if (state.orientation === "horizontal") {
    drawCornerBadge(targetCtx);
    drawHorizontalBrandArea(targetCtx, layout);
    targetCtx.restore();
    return;
  }

  drawCornerBadge(targetCtx);
  if (state.posterMode === "brand") {
    drawBrandArea(targetCtx, layout.brand);
  } else {
    drawNoBrandArea(targetCtx);
  }
  targetCtx.restore();
}

function getCoverPlacement(image, area) {
  const baseScale = Math.max(area.width / image.naturalWidth, area.height / image.naturalHeight);
  const scale = baseScale * imageState.scale;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  return {
    width,
    height,
    x: area.x + (area.width - width) / 2 + imageState.offsetX,
    y: area.y + (area.height - height) / 2 + imageState.offsetY
  };
}

function clampImageOffset() {
  if (!state.userImage) return;

  const { main } = getLayout();
  const image = state.userImage;
  const baseScale = Math.max(main.width / image.naturalWidth, main.height / image.naturalHeight);
  const width = image.naturalWidth * baseScale * imageState.scale;
  const height = image.naturalHeight * baseScale * imageState.scale;
  const maxX = Math.max(0, (width - main.width) / 2);
  const maxY = Math.max(0, (height - main.height) / 2);

  imageState.offsetX = Math.max(-maxX, Math.min(maxX, imageState.offsetX));
  imageState.offsetY = Math.max(-maxY, Math.min(maxY, imageState.offsetY));
  syncCropControls();
}

function drawMainImage(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.width, area.height);
  ctx.clip();

  if (!state.userImage) {
    ctx.fillStyle = config.canvasBackground;
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.fillStyle = "#8e9298";
    ctx.font = "700 44px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("上传图片后可拖拽调整裁切", area.x + area.width / 2, area.y + area.height / 2);
    ctx.restore();
    return;
  }

  const placement = getCoverPlacement(state.userImage, area);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(state.userImage, placement.x, placement.y, placement.width, placement.height);
  ctx.restore();
}

function drawBrandArea(ctx, area) {
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  drawBrandAssets(ctx, area);
  ctx.save();
  applyBrandElementTransform(ctx, getBrandElementBounds());
  drawLogoSlogan(ctx);
  searchBarRenderer.draw(ctx, state.searchText, getBrandSearchLayout());
  ctx.restore();
}

function drawNoBrandArea(ctx) {
  const layout = config.noBrandLayout;
  const isDark = state.noBrandTheme === "dark";
  const gradientImage = isDark ? state.noBrandDarkGradientImage : state.noBrandLightGradientImage;
  const logoImage = isDark ? state.noBrandDarkLogoSloganImage : state.noBrandLightLogoSloganImage;

  if (state.showNoBrandGradient && gradientImage) {
    const sourceWidth = isDark ? layout.darkGradientSourceWidth : layout.lightGradientSourceWidth;
    const sourceHeight = isDark ? layout.darkGradientSourceHeight : layout.lightGradientSourceHeight;
    const placement = getContainPlacement({
      x: 0,
      y: 0,
      width: layout.gradientWidth,
      sourceWidth,
      sourceHeight
    });
    placement.y = state.template.height - placement.height;
    ctx.drawImage(gradientImage, placement.x, placement.y, placement.width, placement.height);
  }

  if (logoImage) {
    ctx.save();
    applyBrandElementTransform(ctx, getBrandElementBounds());
    const sourceWidth = isDark ? layout.darkLogoSourceWidth : layout.lightLogoSourceWidth;
    const sourceHeight = isDark ? layout.darkLogoSourceHeight : layout.lightLogoSourceHeight;
    const placement = getContainPlacement({
      x: 0,
      y: layout.logoSloganY,
      width: layout.logoSloganWidth,
      sourceWidth,
      sourceHeight
    });
    placement.x = (state.template.width - placement.width) / 2;
    if (isUnionLogoActive()) {
      const didDrawUnion = drawUnionLogoStack(ctx, {
        ...placement,
        sourceWidth,
        sourceHeight,
        maxWidth: state.template.width - 96,
        logoOffsetX: config.unionLogoStack.visualOffsetX
      }, isDark ? "white" : "color");
      if (!didDrawUnion) ctx.drawImage(logoImage, placement.x, placement.y, placement.width, placement.height);
    } else {
      ctx.drawImage(logoImage, placement.x, placement.y, placement.width, placement.height);
    }
    ctx.restore();
  }

  ctx.save();
  applyBrandElementTransform(ctx, getBrandElementBounds());
  searchBarRenderer.draw(ctx, state.searchText, getNoBrandSearchLayout());
  ctx.restore();
}

function drawHorizontalBrandArea(ctx, layout) {
  const template = horizontalTemplates[state.horizontalKey];
  const source = config.horizontalAssets.brandSources[template.assetKey];
  const asset = state.horizontalBrandImages[template.assetKey];
  if (!asset || !source) return;

  if (template.layout === "side") {
    drawHorizontalSideBrand(ctx, layout, asset, source);
  } else {
    drawHorizontalBottomBrand(ctx, layout, asset, source);
  }
}

function drawHorizontalBottomBrand(ctx, layout, asset, source) {
  const brandPlacement = getContainPlacement({
    x: 0,
    y: 0,
    width: layout.width,
    sourceWidth: source.width,
    sourceHeight: source.height
  });
  brandPlacement.y = layout.height - brandPlacement.height;
  ctx.drawImage(asset, brandPlacement.x, brandPlacement.y, brandPlacement.width, brandPlacement.height);
  ctx.save();
  applyBrandElementTransform(ctx, brandPlacement);

  const settings = config.horizontalLayout.bottom;
  const override = config.horizontalLayout.overrides[state.horizontalKey] || {};
  const scale = getHorizontalBottomScale(layout.width, settings.baseWidth);
  const searchMode = getSearchBarModeForText(state.searchText);
  const searchWidth = getSearchBarWidthForMode(override.searchWidth || settings.searchWidth * scale, searchMode);
  const searchHeight = getSearchHeight(searchWidth, searchMode);
  const searchRight = override.searchRight || settings.searchRight * scale;
  const searchBottom = override.searchBottom || settings.searchBottom * scale;
  const searchX = layout.width - searchRight - searchWidth;
  const searchY = layout.height - searchBottom - searchHeight;
  const sloganWidth = override.sloganWidth || settings.sloganWidth * scale;
  const sloganPlacement = getContainPlacement({
    x: 0,
    y: 0,
    width: sloganWidth,
    sourceWidth: config.horizontalLayout.sloganSourceWidth,
    sourceHeight: config.horizontalLayout.sloganSourceHeight
  });
  const sloganRight = override.sloganRight || settings.sloganRight * scale;
  const sloganSearchGap = override.sloganSearchGap || settings.sloganSearchGap * scale;
  sloganPlacement.x = layout.width - sloganRight - sloganPlacement.width;
  sloganPlacement.y = searchY - sloganSearchGap - sloganPlacement.height;

  if (state.horizontalLogoImage || isUnionLogoActive()) {
    const logoWidth = settings.logoWidth * scale;
    const logoPlacement = getContainPlacement({
      x: settings.logoX * scale,
      y: 0,
      width: logoWidth,
      sourceWidth: config.horizontalLayout.logoSourceWidth,
      sourceHeight: config.horizontalLayout.logoSourceHeight
    });
    logoPlacement.y = brandPlacement.y + brandPlacement.height * settings.logoCenterYRatio - logoPlacement.height / 2 + settings.logoOffsetY * scale;
    if (isUnionLogoActive()) {
      const rightGuard = Math.min(sloganPlacement.x, searchX) - 28 * scale;
      const didDrawUnion = drawUnionLogo(ctx, {
        left: logoPlacement.x,
        bottom: logoPlacement.y + logoPlacement.height,
        height: logoPlacement.height,
        maxWidth: Math.max(logoPlacement.width, rightGuard - logoPlacement.x)
      }, "white");
      if (!didDrawUnion && state.horizontalLogoImage) {
        ctx.drawImage(state.horizontalLogoImage, logoPlacement.x, logoPlacement.y, logoPlacement.width, logoPlacement.height);
      }
    } else {
      ctx.drawImage(state.horizontalLogoImage, logoPlacement.x, logoPlacement.y, logoPlacement.width, logoPlacement.height);
    }
  }

  if (state.horizontalSloganImage) {
    ctx.drawImage(state.horizontalSloganImage, sloganPlacement.x, sloganPlacement.y, sloganPlacement.width, sloganPlacement.height);
  }

  searchBarRenderer.draw(ctx, state.searchText, {
    width: searchWidth,
    y: searchY,
    x: searchX,
    mode: searchMode,
    sourceWidth: getSearchBarSourceWidth(searchMode),
    sourceHeight: getSearchBarSourceHeight(searchMode),
    scale: searchWidth / getSearchBarSourceWidth(searchMode)
  });
  ctx.restore();
}

function getHorizontalBottomScale(width, baseWidth) {
  return 1 + ((width / baseWidth) - 1) * 0.12;
}

function drawAdjustableSideBrandAssets(ctx, layout, placement) {
  const settings = config.adjustableBrandArea;
  if (state.brandWaistRightImage) {
    const waistWidth = placement.height * (settings.sideWaistSourceWidth / settings.sideWaistSourceHeight);
    const solidX = placement.x + Math.max(0, waistWidth - settings.solidRectOverlap);
    const solidWidth = placement.x + placement.width - solidX;
    ctx.fillStyle = "#ff005c";
    ctx.fillRect(solidX, placement.y, solidWidth, placement.height);
    ctx.drawImage(state.brandWaistRightImage, placement.x, placement.y, waistWidth, placement.height);
    return;
  }

  const waistWidth = placement.height * (settings.waistSourceHeight / settings.waistSourceWidth);
  const solidX = placement.x + Math.max(0, waistWidth - settings.solidRectOverlap);
  const solidWidth = placement.x + placement.width - solidX;
  ctx.fillStyle = "#ff005c";
  ctx.fillRect(solidX, placement.y, solidWidth, placement.height);

  ctx.save();
  ctx.translate(placement.x, placement.y + placement.height);
  ctx.rotate(-Math.PI / 2);
  ctx.drawImage(state.brandWaistImage, 0, 0, placement.height, waistWidth);
  ctx.restore();
}

function drawHorizontalSideBrand(ctx, layout, asset, source) {
  const panelWidth = getActiveSideBrandWidth(layout.width);
  const brandPlacement = isAdjustableSideBrandAreaActive()
    ? { x: layout.width - panelWidth, y: 0, width: panelWidth, height: layout.height }
    : getPlacementByHeight({
        x: layout.width - panelWidth,
        y: 0,
        height: layout.height,
        sourceWidth: source.width,
        sourceHeight: source.height
      });
  if (!isAdjustableSideBrandAreaActive()) brandPlacement.x = layout.width - brandPlacement.width;
  if (isAdjustableSideBrandAreaActive() && state.brandWaistImage) {
    drawAdjustableSideBrandAssets(ctx, layout, brandPlacement);
  } else {
    ctx.drawImage(asset, brandPlacement.x, brandPlacement.y, brandPlacement.width, brandPlacement.height);
  }
  ctx.save();
  applyBrandElementTransform(ctx, brandPlacement);

  const settings = config.horizontalLayout.side;
  const override = config.horizontalLayout.overrides[state.horizontalKey] || {};
  const centerX = brandPlacement.x + brandPlacement.width / 2 + getActiveSideContentOffsetX();
  const searchMode = getSearchBarModeForText(state.searchText);
  const searchWidth = getSearchBarWidthForMode(override.searchWidth || layout.width * settings.searchWidthRatio, searchMode);
  const searchHeight = getSearchHeight(searchWidth, searchMode);
  const shouldCenterInSidePanel = isAdjustableSideBrandAreaActive();
  const searchX = !shouldCenterInSidePanel && override.searchRight !== undefined
    ? layout.width - override.searchRight - searchWidth
    : centerX - searchWidth / 2;
  const searchY = override.searchBottom !== undefined
    ? layout.height - override.searchBottom - searchHeight
    : layout.height * settings.searchCenterYRatio - searchHeight / 2;

  if (state.horizontalLogoSloganImage || isUnionLogoActive()) {
    const logoSloganWidth = override.logoSloganWidth || layout.width * settings.logoSloganWidthRatio;
    const logoSloganPlacement = getContainPlacement({
      x: 0,
      y: 0,
      width: logoSloganWidth,
      sourceWidth: config.horizontalLayout.logoSloganSourceWidth,
      sourceHeight: config.horizontalLayout.logoSloganSourceHeight
    });
    logoSloganPlacement.x = !shouldCenterInSidePanel && override.logoSloganRight !== undefined
      ? layout.width - override.logoSloganRight - logoSloganPlacement.width
      : centerX - logoSloganPlacement.width / 2;
    logoSloganPlacement.y = override.logoSearchGap !== undefined
      ? searchY - override.logoSearchGap - logoSloganPlacement.height
      : layout.height * settings.logoSloganCenterYRatio - logoSloganPlacement.height / 2;
    if (isUnionLogoActive()) {
      const didDrawUnion = drawUnionLogoStack(ctx, {
        ...logoSloganPlacement,
        sourceWidth: config.horizontalLayout.logoSloganSourceWidth,
        sourceHeight: config.horizontalLayout.logoSloganSourceHeight,
        maxWidth: brandPlacement.width * 0.78,
        logoOffsetX: config.unionLogoStack.visualOffsetX
      }, "white");
      if (!didDrawUnion && state.horizontalLogoSloganImage) {
        ctx.drawImage(state.horizontalLogoSloganImage, logoSloganPlacement.x, logoSloganPlacement.y, logoSloganPlacement.width, logoSloganPlacement.height);
      }
    } else {
      ctx.drawImage(state.horizontalLogoSloganImage, logoSloganPlacement.x, logoSloganPlacement.y, logoSloganPlacement.width, logoSloganPlacement.height);
    }
  }

  searchBarRenderer.draw(ctx, state.searchText, {
    width: searchWidth,
    y: searchY,
    x: searchX,
    mode: searchMode,
    sourceWidth: getSearchBarSourceWidth(searchMode),
    sourceHeight: getSearchBarSourceHeight(searchMode),
    scale: searchWidth / getSearchBarSourceWidth(searchMode)
  });
  ctx.restore();
}

function getSearchHeight(width, mode = getSearchBarModeForText(state.searchText)) {
  return width * (getSearchBarSourceHeight(mode) / getSearchBarSourceWidth(mode));
}

function getActiveBrandLayout() {
  const overrideKey = state.template.brandLayoutKey;
  const layout = {
    ...config.brandLayout,
    ...(overrideKey ? config.verticalBrandLayoutOverrides[overrideKey] : {})
  };
  if (!isAdjustableBrandAreaActive()) return layout;

  const brandHeight = getActiveBrandHeight();
  const baseBrandHeight = state.template.brandHeight;
  const heightDelta = brandHeight - baseBrandHeight;
  const logoHeight = (layout.logoSloganWidth * layout.assetScale) *
    (layout.logoSloganSourceHeight / layout.logoSloganSourceWidth);
  const gap = config.adjustableBrandArea.logoSearchGap * layout.assetScale;
  const logoSloganY = layout.logoSloganY + config.adjustableBrandArea.defaultContentOffsetY - heightDelta / 2;

  return {
    ...layout,
    logoSloganY,
    searchBoxY: logoSloganY + logoHeight + gap
  };
}

function getBrandSearchLayout() {
  const brandLayout = getActiveBrandLayout();
  const searchMode = getSearchBarModeForText(state.searchText);
  const width = getSearchBarWidthForMode(brandLayout.searchBoxWidth * brandLayout.assetScale, searchMode);
  return {
    width,
    y: brandLayout.searchBoxY,
    mode: searchMode,
    sourceWidth: getSearchBarSourceWidth(searchMode),
    sourceHeight: getSearchBarSourceHeight(searchMode),
    scale: width / getSearchBarSourceWidth(searchMode)
  };
}

function getNoBrandSearchLayout() {
  const searchMode = getSearchBarModeForText(state.searchText);
  const width = getSearchBarWidthForMode(config.noBrandLayout.searchBoxWidth, searchMode);
  return {
    width,
    y: config.noBrandLayout.searchBoxY,
    mode: searchMode,
    sourceWidth: getSearchBarSourceWidth(searchMode),
    sourceHeight: getSearchBarSourceHeight(searchMode),
    scale: width / getSearchBarSourceWidth(searchMode)
  };
}

function getHorizontalSearchLayout(layout = getLayout()) {
  const template = horizontalTemplates[state.horizontalKey];
  if (!template) return null;

  if (template.layout === "side") {
    const source = config.horizontalAssets.brandSources[template.assetKey];
    if (!source) return null;

    const panelWidth = getActiveSideBrandWidth(layout.width);
    const brandPlacement = isAdjustableSideBrandAreaActive()
      ? { x: layout.width - panelWidth, y: 0, width: panelWidth, height: layout.height }
      : getPlacementByHeight({
          x: layout.width - panelWidth,
          y: 0,
          height: layout.height,
          sourceWidth: source.width,
          sourceHeight: source.height
        });
    if (!isAdjustableSideBrandAreaActive()) brandPlacement.x = layout.width - brandPlacement.width;

    const settings = config.horizontalLayout.side;
    const override = config.horizontalLayout.overrides[state.horizontalKey] || {};
    const centerX = brandPlacement.x + brandPlacement.width / 2 + getActiveSideContentOffsetX();
    const searchMode = getSearchBarModeForText(state.searchText);
    const searchWidth = getSearchBarWidthForMode(override.searchWidth || layout.width * settings.searchWidthRatio, searchMode);
    const searchHeight = getSearchHeight(searchWidth, searchMode);
    const shouldCenterInSidePanel = isAdjustableSideBrandAreaActive();
    const searchX = !shouldCenterInSidePanel && override.searchRight !== undefined
      ? layout.width - override.searchRight - searchWidth
      : centerX - searchWidth / 2;
    const searchY = override.searchBottom !== undefined
      ? layout.height - override.searchBottom - searchHeight
      : layout.height * settings.searchCenterYRatio - searchHeight / 2;

    return {
      width: searchWidth,
      y: searchY,
      x: searchX,
      mode: searchMode,
      sourceWidth: getSearchBarSourceWidth(searchMode),
      sourceHeight: getSearchBarSourceHeight(searchMode),
      scale: searchWidth / getSearchBarSourceWidth(searchMode)
    };
  }

  const settings = config.horizontalLayout.bottom;
  const override = config.horizontalLayout.overrides[state.horizontalKey] || {};
  const scale = getHorizontalBottomScale(layout.width, settings.baseWidth);
  const searchMode = getSearchBarModeForText(state.searchText);
  const searchWidth = getSearchBarWidthForMode(override.searchWidth || settings.searchWidth * scale, searchMode);
  const searchHeight = getSearchHeight(searchWidth, searchMode);
  const searchRight = override.searchRight || settings.searchRight * scale;
  const searchBottom = override.searchBottom || settings.searchBottom * scale;

  return {
    width: searchWidth,
    y: layout.height - searchBottom - searchHeight,
    x: layout.width - searchRight - searchWidth,
    mode: searchMode,
    sourceWidth: getSearchBarSourceWidth(searchMode),
    sourceHeight: getSearchBarSourceHeight(searchMode),
    scale: searchWidth / getSearchBarSourceWidth(searchMode)
  };
}

function getCurrentSearchLayout() {
  if (state.orientation === "horizontal") return getHorizontalSearchLayout();
  return state.posterMode === "brand" ? getBrandSearchLayout() : getNoBrandSearchLayout();
}

function getBrandElementBounds(layout = getLayout()) {
  if (state.orientation !== "horizontal") {
    if (state.posterMode === "brand") return layout.brand;
    return {
      x: 0,
      y: Math.min(config.noBrandLayout.logoSloganY, config.noBrandLayout.searchBoxY) - 80,
      width: state.template.width,
      height: state.template.height - Math.min(config.noBrandLayout.logoSloganY, config.noBrandLayout.searchBoxY) + 80
    };
  }

  const template = horizontalTemplates[state.horizontalKey];
  if (!template) return null;
  const source = config.horizontalAssets.brandSources[template.assetKey];
  if (!source) return null;

  if (template.layout === "side") {
    const panelWidth = getActiveSideBrandWidth(layout.width);
    const placement = isAdjustableSideBrandAreaActive()
      ? { x: layout.width - panelWidth, y: 0, width: panelWidth, height: layout.height }
      : getPlacementByHeight({
          x: layout.width - panelWidth,
          y: 0,
          height: layout.height,
          sourceWidth: source.width,
          sourceHeight: source.height
        });
    if (!isAdjustableSideBrandAreaActive()) placement.x = layout.width - placement.width;
    return placement;
  }

  const placement = getContainPlacement({
    x: 0,
    y: 0,
    width: layout.width,
    sourceWidth: source.width,
    sourceHeight: source.height
  });
  placement.y = layout.height - placement.height;
  return placement;
}

function getSearchBoxPlacement(searchLayout) {
  if (!searchLayout) return null;
  const placement = getContainPlacement({
    x: searchLayout.x || 0,
    y: searchLayout.y,
    width: searchLayout.width,
    sourceWidth: searchLayout.sourceWidth,
    sourceHeight: searchLayout.sourceHeight
  });
  if (searchLayout.x === undefined) {
    placement.x = (state.template.width - placement.width) / 2;
  }
  return transformRect(placement, getBrandElementBounds());
}

function syncPreviewSearchInput() {
  if (!els.previewSearchInput) return;

  const searchLayout = getCurrentSearchLayout();
  const placement = getSearchBoxPlacement(searchLayout);
  const canvasRect = posterCanvas.getBoundingClientRect();
  const frameRect = posterCanvas.parentElement.getBoundingClientRect();
  if (!placement || !canvasRect.width || !canvasRect.height) {
    els.previewSearchInput.classList.remove("is-active");
    return;
  }

  const scaleX = canvasRect.width / posterCanvas.width;
  const scaleY = canvasRect.height / posterCanvas.height;
  const mode = searchLayout.mode || getSearchBarModeForText(els.searchText.value);
  const options = getSearchBarOptionsForMode(mode);
  const effectiveSearchScale = searchLayout.scale * state.brandElementScale;
  const contentWidth = options.contentWidth * effectiveSearchScale * scaleX;
  const contentHeight = options.contentHeight * effectiveSearchScale * scaleY;
  const contentCenterX = canvasRect.left - frameRect.left
    + (placement.x + (options.contentX + options.contentWidth / 2) * effectiveSearchScale) * scaleX
    + options.textOffsetX * state.brandElementScale * scaleX;
  const contentCenterY = canvasRect.top - frameRect.top
    + (placement.y + (options.contentY + options.contentHeight / 2) * effectiveSearchScale + 1) * scaleY;
  const left = contentCenterX - contentWidth / 2;
  const top = contentCenterY - contentHeight / 2;

  els.previewSearchInput.value = els.searchText.value;
  els.previewSearchInput.classList.add("is-active");
  els.previewSearchInput.style.left = `${left}px`;
  els.previewSearchInput.style.top = `${top}px`;
  els.previewSearchInput.style.width = `${contentWidth}px`;
  els.previewSearchInput.style.height = `${contentHeight}px`;
  els.previewSearchInput.style.fontSize = `${options.fixedFontSize * effectiveSearchScale * scaleY}px`;
  els.previewSearchInput.style.lineHeight = `${contentHeight}px`;
  els.previewSearchInput.style.letterSpacing = `${options.fixedFontSize * effectiveSearchScale * scaleX * options.letterSpacing}px`;
}

function drawCornerBadge(ctx) {
  if (!state.showCornerBadge || !state.cornerBadgeImage) return;

  const { x, y, verticalWidthRatio, horizontalWidthRatio, horizontalWidthOverrides, sourceWidth, sourceHeight } = config.cornerBadge;
  const widthRatio = state.orientation === "horizontal" ? horizontalWidthRatio : verticalWidthRatio;
  const width = state.orientation === "horizontal" && horizontalWidthOverrides[state.horizontalKey]
    ? horizontalWidthOverrides[state.horizontalKey]
    : state.template.width * widthRatio;
  const placement = getContainPlacement({ x, y, width, sourceWidth, sourceHeight });
  ctx.drawImage(state.cornerBadgeImage, placement.x, placement.y, placement.width, placement.height);
}

function drawBrandAssets(ctx, area) {
  if (isAdjustableBrandAreaActive() && state.brandWaistImage) {
    const settings = config.adjustableBrandArea;
    const waistHeight = area.width * (settings.waistSourceHeight / settings.waistSourceWidth);
    const solidY = area.y + Math.max(0, waistHeight - settings.solidRectOverlap);
    const solidHeight = area.y + area.height - solidY;
    ctx.fillStyle = "#ff005c";
    ctx.fillRect(area.x, solidY, area.width, solidHeight);
    ctx.drawImage(state.brandWaistImage, area.x, area.y, area.width, waistHeight);
    return;
  }

  const brandAssetKey = state.template.brandAssetKey;
  const asset = brandAssetKey ? state.verticalBrandImages[brandAssetKey] : (state.brandPngImage || state.brandSvgImage);
  const brandLayout = getActiveBrandLayout();
  if (asset) {
    const placement = getContainPlacement({
      x: 0,
      y: area.y,
      width: state.template.width,
      sourceWidth: brandLayout.brandAreaSourceWidth,
      sourceHeight: brandLayout.brandAreaSourceHeight
    });
    ctx.drawImage(asset, placement.x, placement.y, placement.width, placement.height);
    return;
  }

  const gradient = ctx.createLinearGradient(area.x, area.y, area.x + area.width, area.y + area.height);
  gradient.addColorStop(0, "#ff4a38");
  gradient.addColorStop(0.5, "#ff005c");
  gradient.addColorStop(1, "#ff005c");
  ctx.fillStyle = gradient;
  ctx.fillRect(area.x, area.y, area.width, area.height);
}

function isUnionLogoActive() {
  return state.logoScene === "union" && state.unionLogoBaseImages.twoFront?.white;
}

function getImageSize(image) {
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height
  };
}

function getUnionLogos() {
  if (state.unionUploads.length) {
    return state.unionMode === "two" ? state.unionUploads.slice(0, 1) : state.unionUploads;
  }
  return state.unionMode === "two"
    ? [placeholderUnionLogo("LOGO", 0)]
    : [placeholderUnionLogo("LOGO", 0), placeholderUnionLogo("LOGO", 1)];
}

function placeholderUnionLogo(name, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 520;
  canvas.height = 160;
  const canvasCtx = get2dContext(canvas);
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.strokeStyle = "#b8bec8";
  canvasCtx.lineWidth = 6;
  canvasCtx.strokeRect(8, 8, 144, 144);
  canvasCtx.beginPath();
  canvasCtx.moveTo(8, 8);
  canvasCtx.lineTo(152, 152);
  canvasCtx.moveTo(152, 8);
  canvasCtx.lineTo(8, 152);
  canvasCtx.stroke();
  canvasCtx.fillStyle = "#111318";
  canvasCtx.font = "700 78px Arial, sans-serif";
  canvasCtx.textBaseline = "middle";
  canvasCtx.fillText(name || `LOGO ${index + 1}`, 178, 82);
  return {
    image: canvas,
    name: name || `LOGO ${index + 1}`,
    previewUrl: canvas.toDataURL("image/png"),
    placeholder: true
  };
}

function getUnionDouyinAsset(version) {
  if (state.unionMode === "two") {
    return state.unionLogoBaseImages[state.unionDouyinPosition === "back" ? "twoBack" : "twoFront"]?.[version];
  }
  return state.unionLogoBaseImages.multi?.[version];
}

function getUnionPartnerMetrics(logo) {
  const source = logo.image || logo;
  const size = getImageSize(source);
  const height = UNION_BASE_HEIGHT;
  return {
    width: size.height ? (size.width / size.height) * height : height,
    height
  };
}

function syncUnionOrder() {
  const uploadKeys = state.unionUploads.map((upload) => `upload:${upload.id}`);
  const valid = new Set(["douyin", ...uploadKeys]);
  state.unionOrder = state.unionOrder.filter((key) => valid.has(key));
  if (!state.unionOrder.includes("douyin")) state.unionOrder.unshift("douyin");
  uploadKeys.forEach((key) => {
    if (!state.unionOrder.includes(key)) state.unionOrder.push(key);
  });
}

function getActiveUnionOrder() {
  syncUnionOrder();
  return state.unionOrder;
}

function buildUnionSegments(version) {
  const base = getUnionDouyinAsset(version);
  if (!base) return [];

  const baseSize = getImageSize(base);
  const douyin = {
    type: "douyin",
    image: base,
    width: (baseSize.width / baseSize.height) * UNION_BASE_HEIGHT,
    height: UNION_BASE_HEIGHT
  };
  const partners = getUnionLogos().map((logo, index) => {
    const metrics = getUnionPartnerMetrics(logo);
    return {
      key: logo.id ? `upload:${logo.id}` : `placeholder:${index}`,
      type: "partner",
      image: logo.image || logo,
      whiteImage: logo.whiteImage || null,
      width: metrics.width,
      height: metrics.height,
      placeholder: Boolean(logo.placeholder)
    };
  });

  if (state.unionMode === "multi" && state.unionUploads.length) {
    const partnerMap = new Map(partners.map((partner) => [partner.key, partner]));
    return getActiveUnionOrder()
      .map((key) => (key === "douyin" ? douyin : partnerMap.get(key)))
      .filter(Boolean);
  }
  if (state.unionDouyinPosition === "back") return [...partners, douyin];
  return [douyin, ...partners];
}

function getUnionSegmentGaps(segments) {
  const defaultGap = state.unionMode === "two" ? UNION_TWO_GAP : UNION_MULTI_GAP;
  return segments.slice(1).map((segment, index) => {
    const previous = segments[index];
    if (
      state.unionMode === "two" &&
      state.unionDouyinPosition === "back" &&
      previous.type === "partner" &&
      previous.placeholder &&
      segment.type === "douyin"
    ) {
      return UNION_TWO_BACK_PLACEHOLDER_GAP;
    }
    return defaultGap;
  });
}

function drawUnionPartnerLogo(targetCtx, item, x, y, width, height, version) {
  if (version === "white" && state.unionWhiteMode === "upload" && item.whiteImage) {
    targetCtx.drawImage(item.whiteImage, x, y, width, height);
    return;
  }
  if (version === "white") {
    const mask = document.createElement("canvas");
    mask.width = Math.max(1, Math.ceil(width * 4));
    mask.height = Math.max(1, Math.ceil(height * 4));
    const maskCtx = get2dContext(mask);
    maskCtx.setTransform(4, 0, 0, 4, 0, 0);
    maskCtx.drawImage(item.image, 0, 0, width, height);
    maskCtx.globalCompositeOperation = "source-in";
    maskCtx.fillStyle = "#ffffff";
    maskCtx.fillRect(0, 0, width, height);
    targetCtx.drawImage(mask, x, y, width, height);
    return;
  }
  targetCtx.drawImage(item.image, x, y, width, height);
}

function createUnionLogoCanvas(version) {
  const segments = buildUnionSegments(version);
  if (!segments.length) return null;
  const gaps = getUnionSegmentGaps(segments);
  const contentWidth =
    segments.reduce((sum, item) => sum + item.width, 0) + gaps.reduce((sum, item) => sum + item, 0);
  const padding = 0;
  const width = Math.ceil(contentWidth + padding * 2);
  const height = UNION_BASE_HEIGHT;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width * 4);
  canvas.height = Math.max(1, height * 4);
  const canvasCtx = get2dContext(canvas);
  canvasCtx.setTransform(4, 0, 0, 4, 0, 0);
  canvasCtx.clearRect(0, 0, width, height);
  canvasCtx.imageSmoothingEnabled = true;
  canvasCtx.imageSmoothingQuality = "high";

  let cursorX = padding;
  segments.forEach((item, index) => {
    if (index > 0) cursorX += gaps[index - 1];
    if (item.type === "douyin") {
      canvasCtx.drawImage(item.image, cursorX, (height - item.height) / 2, item.width, item.height);
    } else {
      drawUnionPartnerLogo(canvasCtx, item, cursorX, (height - item.height) / 2, item.width, item.height, version);
    }
    cursorX += item.width;
  });
  canvas.dataset.sourceWidth = String(width);
  canvas.dataset.sourceHeight = String(height);
  return canvas;
}

function drawUnionLogo(ctx, placement, version = "white") {
  if (!isUnionLogoActive()) return false;
  const image = createUnionLogoCanvas(version);
  if (!image) return false;
  const sourceWidth = Number(image.dataset.sourceWidth || image.width / 4);
  const sourceHeight = Number(image.dataset.sourceHeight || image.height / 4);
  const scale = placement.height / sourceHeight;
  const naturalWidth = sourceWidth * scale;
  const maxScale = Math.min(state.unionLogoScale, placement.maxWidth / naturalWidth);
  const finalScale = Number.isFinite(maxScale) && maxScale > 0 ? Math.min(1, maxScale) : state.unionLogoScale;
  const width = naturalWidth * finalScale;
  const height = placement.height * finalScale;
  const x = placement.left !== undefined
    ? placement.left + (placement.offsetX || 0)
    : placement.centerX - width / 2 + (placement.offsetX || 0);
  const y = placement.bottom !== undefined
    ? placement.bottom - height + (placement.offsetY || 0)
    : placement.centerY - height / 2 + (placement.offsetY || 0);
  ctx.drawImage(image, x, y, width, height);
  return true;
}

function getUnionSloganImage(version) {
  return version === "white" ? state.unionSloganWhiteImage : state.unionSloganColorImage;
}

function getUnionSloganSource(version) {
  const assets = config.unionSloganAssets;
  return version === "white"
    ? { width: assets.whiteSourceWidth, height: assets.whiteSourceHeight }
    : { width: assets.colorSourceWidth, height: assets.colorSourceHeight };
}

function drawUnionLogoStack(ctx, frame, version = "white") {
  if (!isUnionLogoActive()) return false;
  const stackOffsetY = config.unionLogoStack.offsetY || 0;
  const sloganImage = getUnionSloganImage(version);
  if (!sloganImage) return drawUnionLogo(ctx, {
    centerX: frame.x + frame.width / 2,
    centerY: frame.y + frame.height / 2 + stackOffsetY,
    height: frame.height * 0.45,
    maxWidth: frame.maxWidth || frame.width
  }, version);

  const sloganSource = getUnionSloganSource(version);
  const frameSourceWidth = frame.sourceWidth || sloganSource.width;
  const baseSloganWidth = frame.width * (sloganSource.width / frameSourceWidth);
  const baseSloganHeight = baseSloganWidth * (sloganSource.height / sloganSource.width);
  const sloganHeight = baseSloganHeight + config.unionLogoStack.sloganHeightDelta;
  const sloganWidth = sloganHeight * (sloganSource.width / sloganSource.height);
  const sloganX = frame.x + (frame.width - sloganWidth) / 2;
  const sloganY = frame.y + frame.height - sloganHeight + stackOffsetY;
  const gap = Math.max(8, frame.height * 0.07);
  const maxLogoHeight = Math.max(1, sloganY - frame.y - gap);
  const logoHeight = Math.min(frame.height * 0.45, maxLogoHeight);
  const didDrawLogo = drawUnionLogo(ctx, {
    centerX: frame.x + frame.width / 2,
    centerY: sloganY - gap - logoHeight / 2 + (config.unionLogoStack.logoOffsetY || 0),
    height: logoHeight,
    maxWidth: frame.maxWidth || frame.width,
    offsetX: frame.logoOffsetX || 0
  }, version);
  if (!didDrawLogo) return false;
  ctx.drawImage(sloganImage, sloganX, sloganY + (config.unionLogoStack.sloganOffsetY || 0), sloganWidth, sloganHeight);
  return true;
}

function drawLogoSlogan(ctx) {
  const {
    assetScale,
    logoSloganWidth,
    logoSloganSourceWidth,
    logoSloganSourceHeight,
    logoSloganY
  } = getActiveBrandLayout();

  const singlePlacement = getContainPlacement({
    x: 0,
    y: logoSloganY,
    width: logoSloganWidth * assetScale,
    sourceWidth: logoSloganSourceWidth,
    sourceHeight: logoSloganSourceHeight
  });
  singlePlacement.x = (state.template.width - singlePlacement.width) / 2;

  if (isUnionLogoActive()) {
    const didDrawUnion = drawUnionLogoStack(ctx, {
      ...singlePlacement,
      sourceWidth: logoSloganSourceWidth,
      sourceHeight: logoSloganSourceHeight,
      maxWidth: state.template.width - 96,
      logoOffsetX: config.unionLogoStack.visualOffsetX
    }, "white");
    if (didDrawUnion) return;
  }

  if (state.logoSloganImage) {
    ctx.drawImage(state.logoSloganImage, singlePlacement.x, singlePlacement.y, singlePlacement.width, singlePlacement.height);
    return;
  }

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 54px DouyinSansBold, PingFang SC, sans-serif";
  ctx.fillText("抖音商城", state.template.width / 2, logoSloganY + 58);
  ctx.font = "700 54px DouyinSansBold, PingFang SC, sans-serif";
  ctx.fillText("总能发现好东西!", state.template.width / 2, logoSloganY + 145);
}

function drawSearchBar(ctx, text, searchLayout = getBrandSearchLayout()) {
  const mode = searchLayout.mode || getSearchBarModeForText(text);
  const options = getSearchBarOptionsForMode(mode);
  const searchBoxImage = mode === "long" ? state.searchBoxLongImage : state.searchBoxImage;
  const assetScale = searchLayout.scale;
  const boxPlacement = searchBoxImage
    ? getContainPlacement({
        x: searchLayout.x || 0,
        y: searchLayout.y,
        width: searchLayout.width,
        sourceWidth: searchLayout.sourceWidth,
        sourceHeight: searchLayout.sourceHeight
      })
    : { x: searchLayout.x || 0, y: searchLayout.y, width: searchLayout.width, height: 53.43 * assetScale };
  if (searchLayout.x === undefined) {
    boxPlacement.x = (state.template.width - boxPlacement.width) / 2;
  }

  if (searchBoxImage) {
    ctx.drawImage(searchBoxImage, boxPlacement.x, boxPlacement.y, boxPlacement.width, boxPlacement.height);
  }

  const validation = validateSearchText(text);
  const displayText = validation.ok ? validation.value : "";
  if (displayText) {
    const targetWidth = options.contentWidth * options.maxWidthRatio;
    const fontSize = fitSearchText(ctx, displayText, targetWidth, options);
    if (!fontSize) return;
    ctx.fillStyle = options.textColor;
    ctx.font = `700 ${fontSize * assetScale}px ${options.fontFamily}, PingFang SC, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    drawTextWithLetterSpacing(
      ctx,
      displayText,
      boxPlacement.x + (options.contentX + options.contentWidth / 2) * assetScale + options.textOffsetX,
      boxPlacement.y + (options.contentY + options.contentHeight / 2) * assetScale + 1,
      fontSize * assetScale * options.letterSpacing
    );
  }
}

function measureTextWithLetterSpacing(ctx, text, spacing) {
  const chars = Array.from(text);
  const textWidth = chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0);
  return textWidth + Math.max(0, chars.length - 1) * spacing;
}

function drawTextWithLetterSpacing(ctx, text, centerX, centerY, spacing) {
  const chars = Array.from(text);
  const totalWidth = measureTextWithLetterSpacing(ctx, text, spacing);
  let x = centerX - totalWidth / 2;

  ctx.textAlign = "left";
  for (const char of chars) {
    ctx.fillText(char, x, centerY);
    x += ctx.measureText(char).width + spacing;
  }
  ctx.textAlign = "center";
}

function getContainPlacement(target) {
  const width = target.width;
  const height = width * (target.sourceHeight / target.sourceWidth);
  return {
    x: target.x || 0,
    y: target.y || 0,
    width,
    height
  };
}

function getPlacementByHeight(target) {
  const height = target.height;
  const width = height * (target.sourceWidth / target.sourceHeight);
  return {
    x: target.x || 0,
    y: target.y || 0,
    width,
    height
  };
}

function updateTemplateSelection() {
  const preset = templatePresets[state.templatePreset] || templatePresets.douyin9x16;
  state.orientation = preset.orientation;
  if (preset.horizontalKey) state.horizontalKey = preset.horizontalKey;
  if (preset.templateKey) state.templateKey = preset.templateKey;
  state.template = state.orientation === "horizontal"
    ? horizontalTemplates[state.horizontalKey]
    : templates[state.templateKey];
  syncTemplateCategoryUI();
  syncBrandHeightControls();
  drawPoster();
}

function getCategoryForPreset(presetKey) {
  return Object.entries(templateCategories).find(([, presets]) => presets.includes(presetKey))?.[0] || "social";
}

function syncTemplateCategoryUI() {
  state.templateCategory = getCategoryForPreset(state.templatePreset);

  document.querySelectorAll('input[name="templateCategory"]').forEach((input) => {
    input.checked = input.value === state.templateCategory;
  });

  document.querySelectorAll("[data-template-category]").forEach((group) => {
    group.classList.toggle("is-active", group.dataset.templateCategory === state.templateCategory);
  });
}

function validateSearchText(text) {
  const value = text.trim();
  if (!value) return { ok: true, value: "", type: "empty", message: "" };

  if (!/^[\u4e00-\u9fffA-Za-z0-9]+$/.test(value)) {
    return { ok: false, value, message: `请输入中文、英文字母或数字，总长度不超过 ${config.searchBar.maxWeightedLength}` };
  }

  const weightedLength = getWeightedSearchLength(value);

  if (weightedLength >= 1 && weightedLength <= config.searchBar.maxWeightedLength) {
    return { ok: true, value, type: "mixed", weightedLength, message: "" };
  }

  return { ok: false, value, message: `输入长度过长，请控制在 ${config.searchBar.maxWeightedLength} 以内` };
}

function fitSearchText(ctx, text, targetWidth, options = config.searchBar) {
  ctx.font = `700 ${options.fixedFontSize}px ${options.fontFamily}, PingFang SC, sans-serif`;
  const spacing = options.fixedFontSize * options.letterSpacing;
  return measureTextWithLetterSpacing(ctx, text, spacing) <= targetWidth ? options.fixedFontSize : null;
}

function validateSearchTextWidth(text) {
  if (!text) return { ok: true, message: "" };

  const mode = getSearchBarModeForText(text);
  const options = getSearchBarOptionsForMode(mode);
  ctx.font = `700 ${options.fixedFontSize}px ${options.fontFamily}, PingFang SC, sans-serif`;
  const maxWidth = options.contentWidth * options.maxWidthRatio;
  const spacing = options.fixedFontSize * options.letterSpacing;
  if (measureTextWithLetterSpacing(ctx, text, spacing) <= maxWidth) return { ok: true, message: "" };

  return { ok: false, message: mode === "long" ? "输入宽度超过长版搜索框，请缩短搜索词" : "输入宽度超过搜索框，请缩短搜索词" };
}

function updateSearchTextFromValue(value) {
  els.searchText.value = value;
  if (els.previewSearchInput) els.previewSearchInput.value = value;

  const validation = validateSearchText(value);
  state.lastValidation = validation;
  const widthValidation = validation.ok ? validateSearchTextWidth(validation.value) : { ok: false, message: "" };
  els.searchError.textContent = validation.message || widthValidation.message;
  state.searchText = validation.ok && widthValidation.ok ? validation.value : "";
  drawPoster();
}

function normalizePngLogo(image) {
  const source = document.createElement("canvas");
  source.width = image.naturalWidth || image.width;
  source.height = image.naturalHeight || image.height;
  const sourceCtx = get2dContext(source, { willReadFrequently: true });
  sourceCtx.drawImage(image, 0, 0);

  const bounds = findAlphaBounds(sourceCtx, source.width, source.height);
  if (!bounds) return { image, previewUrl: image.src };

  const padding = Math.ceil(Math.max(bounds.width, bounds.height) * 0.02);
  const sx = Math.max(0, bounds.x - padding);
  const sy = Math.max(0, bounds.y - padding);
  const sw = Math.min(source.width - sx, bounds.width + padding * 2);
  const sh = Math.min(source.height - sy, bounds.height + padding * 2);
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  get2dContext(canvas).drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
  return {
    image: canvas,
    previewUrl: canvas.toDataURL("image/png")
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
    height: maxY - minY + 1
  };
}

function readUnionUpload(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== "image/png") {
      reject(new Error("只能上传 PNG 文件"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const normalized = normalizePngLogo(image);
        resolve({
          id: state.nextUnionUploadId++,
          image: normalized.image,
          name: file.name,
          previewUrl: normalized.previewUrl
        });
      };
      image.onerror = reject;
      image.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function assignUnionWhiteUploads(files, modeAtUpload) {
  const limit = modeAtUpload === "two" ? files.slice(0, 1) : files;
  const uploads = await Promise.all(limit.map(readUnionUpload));
  const targetUploads = modeAtUpload === "two" ? state.unionUploads.slice(0, 1) : state.unionUploads;
  uploads.forEach((upload, index) => {
    if (targetUploads[index]) {
      targetUploads[index].whiteImage = upload.image;
      targetUploads[index].whitePreviewUrl = upload.previewUrl;
    }
  });
}

function moveUnionUpload(index, direction) {
  if (state.unionMode === "multi") {
    const target = index + direction;
    if (target < 0 || target >= state.unionOrder.length) return;
    const [item] = state.unionOrder.splice(index, 1);
    state.unionOrder.splice(target, 0, item);
  } else {
    const target = index + direction;
    if (target < 0 || target >= state.unionUploads.length) return;
    const [item] = state.unionUploads.splice(index, 1);
    state.unionUploads.splice(target, 0, item);
  }
  renderUnionControls();
  drawPoster();
}

function removeUnionUpload(uploadIndex) {
  const [removed] = state.unionUploads.splice(uploadIndex, 1);
  if (removed) state.unionOrder = state.unionOrder.filter((key) => key !== `upload:${removed.id}`);
  renderUnionControls();
  drawPoster();
}

function unionDouyinThumb() {
  if (state.unionMode === "two") {
    const key = state.unionDouyinPosition === "back" ? "twoBack" : "twoFront";
    return resolveAssetSrc(config.unionLogoAssets[key]?.color || "");
  }
  return resolveAssetSrc(config.unionLogoAssets.multi?.color || "");
}

function getUnionOrderRows() {
  if (state.unionMode !== "multi") {
    return state.unionUploads.map((upload, index) => ({
      key: `upload:${upload.id}`,
      uploadIndex: index,
      name: upload.whiteImage ? `${upload.name} / 已配反白` : upload.name,
      previewUrl: upload.previewUrl,
      removable: true
    }));
  }
  const uploadMap = new Map(
    state.unionUploads.map((upload, index) => [
      `upload:${upload.id}`,
      {
        key: `upload:${upload.id}`,
        uploadIndex: index,
        name: upload.whiteImage ? `${upload.name} / 已配反白` : upload.name,
        previewUrl: upload.previewUrl,
        removable: true
      }
    ])
  );
  return getActiveUnionOrder()
    .map((key) => key === "douyin"
      ? { key: "douyin", name: "抖音商城", previewUrl: unionDouyinThumb(), removable: false }
      : uploadMap.get(key))
    .filter(Boolean);
}

function renderUnionLogoList() {
  if (!els.unionLogoList) return;
  const rows = getUnionOrderRows();
  els.unionOrderField.classList.toggle("is-hidden", rows.length === 0);
  els.unionOrderLabel.textContent = state.unionMode === "multi" ? "呈现顺序" : "上传顺序";
  els.unionUploadCount.textContent = state.unionMode === "multi" ? `${rows.length} 项` : `${state.unionUploads.length} 张`;
  els.unionLogoList.replaceChildren(
    ...rows.map((item, index) => {
      const row = document.createElement("div");
      row.className = "logo-item";
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
      up.addEventListener("click", () => moveUnionUpload(index, -1));
      const down = document.createElement("button");
      down.type = "button";
      down.textContent = "↓";
      down.title = "下移";
      down.disabled = index === rows.length - 1;
      down.addEventListener("click", () => moveUnionUpload(index, 1));
      tools.append(up, down);
      if (item.removable) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "×";
        remove.title = "移除";
        remove.addEventListener("click", () => removeUnionUpload(item.uploadIndex));
        tools.append(remove);
      }
      row.append(thumb, name, tools);
      return row;
    })
  );
}

function renderUnionControls() {
  if (!els.unionLogoOptions) return;
  els.unionLogoOptions.classList.toggle("is-hidden", state.logoScene !== "union");
  els.unionPositionField.classList.toggle("is-hidden", state.unionMode !== "two");
  els.unionWhiteUploadWrap.classList.toggle("is-hidden", state.unionWhiteMode !== "upload");
  els.unionLogoUpload.multiple = state.unionMode === "multi";
  els.unionWhiteLogoUpload.multiple = state.unionMode === "multi";
  els.unionLogoScale.value = Math.round(state.unionLogoScale * 100);
  els.unionLogoScaleValue.textContent = `${Math.round(state.unionLogoScale * 100)}%`;
  document.querySelectorAll('input[name="logoScene"]').forEach((input) => {
    input.checked = input.value === state.logoScene;
  });
  document.querySelectorAll('input[name="unionMode"]').forEach((input) => {
    input.checked = input.value === state.unionMode;
  });
  document.querySelectorAll('input[name="unionDouyinPosition"]').forEach((input) => {
    input.checked = input.value === state.unionDouyinPosition;
  });
  document.querySelectorAll('input[name="unionWhiteMode"]').forEach((input) => {
    input.checked = input.value === state.unionWhiteMode;
  });
  renderUnionLogoList();
}

function syncBrandHeightControls() {
  if (!els.brandHeightOptions) return;
  const visible = isAdjustableBrandAreaActive() || isAdjustableSideBrandAreaActive();
  els.brandHeightOptions.classList.toggle("is-hidden", !visible);
  const settings = config.adjustableBrandArea;
  const min = isAdjustableSideBrandAreaActive() ? getActiveSideBrandMinRatio() : settings.minRatio;
  const max = isAdjustableSideBrandAreaActive() ? getActiveSideBrandMaxRatio() : settings.maxRatio;
  if (state.brandHeightRatio < min || state.brandHeightRatio > max) state.brandHeightRatio = min;
  els.brandHeightRatio.min = Math.round(min * 100);
  els.brandHeightRatio.max = Math.round(max * 100);
  els.brandHeightRatio.value = Math.round(state.brandHeightRatio * 100);
  els.brandHeightRatioValue.textContent = `${Math.round(state.brandHeightRatio * 100)}%`;
}

function canvasToBlob(canvas, mimeType, quality = 1) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas export returned an empty file."));
        }
      }, mimeType, quality);
    } catch (error) {
      reject(error);
    }
  });
}

async function downloadPoster(type) {
  const exportScale = config.exportScale;
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = state.template.width * exportScale;
  exportCanvas.height = state.template.height * exportScale;
  const exportCtx = get2dContext(exportCanvas);
  exportCtx.imageSmoothingEnabled = true;
  exportCtx.imageSmoothingQuality = "high";

  if (type === "jpg") {
    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  }

  try {
    renderPoster(exportCtx, exportScale);
    const mimeType = type === "jpg" ? "image/jpeg" : "image/png";
    const blob = await canvasToBlob(exportCanvas, mimeType, 1);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `douyin-brand-poster-${exportCanvas.width}x${exportCanvas.height}.${type === "jpg" ? "jpg" : "png"}`;
    link.href = url;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error(error);
    alert("下载失败：浏览器拦截了本地素材导出。请刷新页面后重试，或用本地服务打开工具页面。");
  }
}

function resetImageState() {
  imageState.scale = 1;
  imageState.offsetX = 0;
  imageState.offsetY = 0;
  syncCropControls();
}

function syncCropControls() {
  els.imageScale.value = Math.round(imageState.scale * 100);
  els.imageScaleValue.textContent = `${Math.round(imageState.scale * 100)}%`;
  els.offsetX.value = Math.round(imageState.offsetX);
  els.offsetY.value = Math.round(imageState.offsetY);
}

function syncBrandElementControls() {
  if (!els.brandElementScale) return;
  els.brandElementScale.value = Math.round(state.brandElementScale * 100);
  els.brandElementScaleValue.textContent = `${Math.round(state.brandElementScale * 100)}%`;
  els.brandElementOffsetX.value = Math.round(state.brandElementOffsetX);
  els.brandElementOffsetXValue.textContent = `${Math.round(state.brandElementOffsetX)}px`;
  els.brandElementOffsetY.value = Math.round(state.brandElementOffsetY);
  els.brandElementOffsetYValue.textContent = `${Math.round(state.brandElementOffsetY)}px`;
}

function setImageScale(percent, anchor) {
  const oldScale = imageState.scale;
  const nextScale = Math.max(1, Math.min(3, percent / 100));
  if (anchor && state.userImage) {
    imageState.offsetX = anchor.x - (anchor.x - imageState.offsetX) * (nextScale / oldScale);
    imageState.offsetY = anchor.y - (anchor.y - imageState.offsetY) * (nextScale / oldScale);
  }
  imageState.scale = nextScale;
  clampImageOffset();
  drawPoster();
}

function canvasPoint(event) {
  const rect = posterCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * posterCanvas.width,
    y: ((event.clientY - rect.top) / rect.height) * posterCanvas.height
  };
}

function bindEvents() {
  els.imageUpload.addEventListener("change", (event) => loadUserImage(event.target.files[0]));

  document.querySelectorAll('input[name="templatePreset"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.templatePreset = input.value;
      updateTemplateSelection();
    });
  });

  document.querySelectorAll('input[name="templateCategory"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.templateCategory = input.value;
      state.templatePreset = templateCategories[state.templateCategory][0];
      const presetInput = document.querySelector(`input[name="templatePreset"][value="${state.templatePreset}"]`);
      if (presetInput) presetInput.checked = true;
      updateTemplateSelection();
    });
  });

  document.querySelectorAll('input[name="posterMode"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.posterMode = input.value;
      els.noBrandOptions.classList.toggle("is-hidden", state.posterMode !== "noBrand");
      syncBrandHeightControls();
      drawPoster();
    });
  });

  document.querySelectorAll('input[name="noBrandTheme"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.noBrandTheme = input.value;
      drawPoster();
    });
  });

  els.gradientToggle.addEventListener("change", () => {
    state.showNoBrandGradient = els.gradientToggle.checked;
    drawPoster();
  });

  els.badgeToggle.addEventListener("change", () => {
    state.showCornerBadge = els.badgeToggle.checked;
    drawPoster();
  });

  els.brandHeightRatio.addEventListener("input", () => {
    state.brandHeightRatio = Number(els.brandHeightRatio.value) / 100;
    syncBrandHeightControls();
    drawPoster();
  });

  els.brandElementScale.addEventListener("input", () => {
    state.brandElementScale = Number(els.brandElementScale.value) / 100;
    syncBrandElementControls();
    drawPoster();
  });
  els.brandElementOffsetX.addEventListener("input", () => {
    state.brandElementOffsetX = Number(els.brandElementOffsetX.value) || 0;
    syncBrandElementControls();
    drawPoster();
  });
  els.brandElementOffsetY.addEventListener("input", () => {
    state.brandElementOffsetY = Number(els.brandElementOffsetY.value) || 0;
    syncBrandElementControls();
    drawPoster();
  });
  els.resetBrandElements.addEventListener("click", () => {
    state.brandElementScale = 1;
    state.brandElementOffsetX = 0;
    state.brandElementOffsetY = 0;
    syncBrandElementControls();
    drawPoster();
  });

  document.querySelectorAll('input[name="logoScene"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.logoScene = input.value;
      renderUnionControls();
      drawPoster();
    });
  });

  document.querySelectorAll('input[name="unionMode"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.unionMode = input.value;
      if (state.unionMode === "two") {
        state.unionUploads = state.unionUploads.slice(0, 1);
        state.unionDouyinPosition = state.unionDouyinPosition === "back" ? "back" : "front";
      }
      syncUnionOrder();
      els.unionLogoUpload.value = "";
      els.unionWhiteLogoUpload.value = "";
      renderUnionControls();
      drawPoster();
    });
  });

  document.querySelectorAll('input[name="unionDouyinPosition"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.unionDouyinPosition = input.value;
      renderUnionControls();
      drawPoster();
    });
  });

  document.querySelectorAll('input[name="unionWhiteMode"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.unionWhiteMode = input.value;
      renderUnionControls();
      drawPoster();
    });
  });

  els.unionLogoUpload.addEventListener("change", (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    const modeAtUpload = state.unionMode;
    state.unionUploadQueue = state.unionUploadQueue
      .then(async () => {
        const limit = modeAtUpload === "two" ? files.slice(0, 1) : files;
        const uploads = await Promise.all(limit.map(readUnionUpload));
        state.unionUploads = modeAtUpload === "two" ? uploads.slice(0, 1) : [...state.unionUploads, ...uploads];
        syncUnionOrder();
        els.unionLogoUpload.value = "";
        renderUnionControls();
        drawPoster();
      })
      .catch((error) => {
        alert(error.message || "上传失败，请使用透明 PNG 文件。");
        els.unionLogoUpload.value = "";
      });
  });

  els.unionWhiteLogoUpload.addEventListener("change", (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    const modeAtUpload = state.unionMode;
    state.unionUploadQueue = state.unionUploadQueue
      .then(async () => {
        await assignUnionWhiteUploads(files, modeAtUpload);
        els.unionWhiteLogoUpload.value = "";
        renderUnionControls();
        drawPoster();
      })
      .catch((error) => {
        alert(error.message || "反白 logo 上传失败，请使用 PNG 文件。");
        els.unionWhiteLogoUpload.value = "";
      });
  });

  els.unionLogoScale.addEventListener("input", () => {
    state.unionLogoScale = Number(els.unionLogoScale.value) / 100;
    renderUnionControls();
    drawPoster();
  });

  els.searchText.addEventListener("input", () => updateSearchTextFromValue(els.searchText.value));
  els.previewSearchInput.addEventListener("input", () => updateSearchTextFromValue(els.previewSearchInput.value));
  els.previewSearchInput.addEventListener("focus", () => syncPreviewSearchInput());

  els.imageScale.addEventListener("input", () => setImageScale(Number(els.imageScale.value)));
  els.offsetX.addEventListener("input", () => {
    imageState.offsetX = Number(els.offsetX.value) || 0;
    clampImageOffset();
    drawPoster();
  });
  els.offsetY.addEventListener("input", () => {
    imageState.offsetY = Number(els.offsetY.value) || 0;
    clampImageOffset();
    drawPoster();
  });

  els.autoCenter.addEventListener("click", () => {
    imageState.offsetX = 0;
    imageState.offsetY = 0;
    clampImageOffset();
    drawPoster();
  });
  els.resetImage.addEventListener("click", () => {
    resetImageState();
    drawPoster();
  });
  els.downloadPng.addEventListener("click", () => downloadPoster("png"));
  els.downloadJpg.addEventListener("click", () => downloadPoster("jpg"));

  posterCanvas.addEventListener("pointerdown", (event) => {
    if (!state.userImage) return;
    state.isDragging = true;
    posterCanvas.classList.add("dragging");
    posterCanvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    state.dragStartX = point.x;
    state.dragStartY = point.y;
    state.dragOffsetX = imageState.offsetX;
    state.dragOffsetY = imageState.offsetY;
  });

  posterCanvas.addEventListener("pointermove", (event) => {
    if (!state.isDragging) return;
    const point = canvasPoint(event);
    imageState.offsetX = state.dragOffsetX + point.x - state.dragStartX;
    imageState.offsetY = state.dragOffsetY + point.y - state.dragStartY;
    clampImageOffset();
    drawPoster();
  });

  posterCanvas.addEventListener("pointerup", endDrag);
  posterCanvas.addEventListener("pointercancel", endDrag);

  posterCanvas.addEventListener(
    "wheel",
    (event) => {
      if (!state.userImage) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -6 : 6;
      const nextPercent = Number(els.imageScale.value) + delta;
      setImageScale(nextPercent);
    },
    { passive: false }
  );

  window.addEventListener("resize", syncPreviewSearchInput);
}

function endDrag(event) {
  state.isDragging = false;
  posterCanvas.classList.remove("dragging");
  if (event.pointerId !== undefined && posterCanvas.hasPointerCapture(event.pointerId)) {
    posterCanvas.releasePointerCapture(event.pointerId);
  }
}

async function init() {
  bindEvents();
  syncCropControls();
  syncBrandElementControls();
  syncBrandHeightControls();
  renderUnionControls();
  await document.fonts.ready;
  await loadBrandAssets();
  drawPoster();
}

init();
