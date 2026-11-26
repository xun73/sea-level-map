/* global L */

const state = { level: 1, pending: 0, loaded: 0, failed: 0, generation: 0 };
const TILE_SIZE = 256;
const ELEVATION_ATTRIBUTION = 'Elevation: <a href="https://registry.opendata.aws/terrain-tiles/">Mapzen/AWS</a>';
let sliderTimer;

const I18N = {
  "zh-Hant": {
    pageTitle: "海平面變化地圖",
    metaDescription: "互動式全球海平面變化情境地圖",
    brand: "海平面變化地圖",
    brandAria: "海平面變化地圖首頁",
    languageLabel: "介面語言",
    aboutButton: "模型說明",
    mapAria: "互動式海平面地圖",
    controlsAria: "海平面情境控制",
    controlsTitle: "海平面高度／情境",
    zoomIn: "放大",
    zoomOut: "縮小",
    sliderLabel: "自訂高度（非氣候預測）",
    scenarioGroupAria: "選擇海平面情境",
    legendAria: "圖例",
    possibleFlood: "可能淹沒區",
    possibleExposure: "可能曝露陸地",
    presentLand: "現今陸地",
    loadingElevation: "正在載入高程資料…",
    calculating: (count) => `正在計算高程遮罩（${count}）…`,
    loadError: "高程資料無法載入，請檢查網路連線",
    updated: "高程遮罩已更新",
    tileError: "高程圖磚載入失敗",
    currentSeaAria: "目前海平面",
    levelAria: (negative, value) => `海平面${negative ? "下降" : "上升"} ${value} 公尺`,
    customDescription: "自訂海平面比較高度；此數值不是 SSP 氣候模型輸出。",
    close: "關閉",
    aboutEyebrow: "關於模型",
    aboutTitle: "海平面高度影響示意圖",
    aboutLead: "本網站將數值高程模型（DEM）與使用者設定的海平面高度比較，<strong>不會自行計算氣候變遷，也不會預測未來海平面</strong>。IPCC 資料提供氣候評估背景；左側滑桿並不是與 SSP 情境連動的氣候模型輸出。",
    ipccTitle: "IPCC 氣候預測情境",
    sspIntro: "<strong>SSP（共享社會經濟路徑）</strong>描述不同的社會經濟、排放與政策未來，用來探索可能的氣候反應；它們不是對未來的確定預言，也不代表發生機率。",
    sspNaming: "名稱中連字號前的編號代表社會經濟發展路徑；連字號後的數字代表約在 2100 年的輻射強迫水平，單位為 W/m²，<strong>不是升溫幾度，也不是海平面上升幾公尺</strong>。同一 SSP 家族可搭配不同排放與政策路徑，例如 SSP1-1.9 與 SSP1-2.6。下列五項是 AR6 選用的核心示意情境，不是每個 SSP 家族各一條的完整清單。",
    tableAria: "IPCC AR6 核心 SSP 情境比較表，可水平捲動",
    tableCaption: "IPCC AR6 五種核心情境",
    scenarioColumn: "情境",
    forcingColumn: "約 2100 年<br />輻射強迫",
    warmingColumn: "2081–2100 全球升溫<br /><small>相較 1850–1900</small>",
    seaLevelColumn: "2100 全球平均海平面上升<br /><small>相較 1995–2014</small>",
    temp119: "1.4°C（1.0–1.8°C）",
    temp126: "1.8°C（1.3–2.4°C）",
    temp245: "2.7°C（2.1–3.5°C）",
    temp370: "3.6°C（2.8–4.6°C）",
    temp585: "4.4°C（3.3–5.7°C）",
    tableNote: "溫度欄為最佳估計（括號內為極可能範圍）；海平面欄為可能範圍。兩者基準期不同，請勿直接混用。",
    understandTitle: "如何理解左側高度",
    understandOne: "<strong>+1 m：</strong>接近 AR6 五種核心情境在 2100 年全球平均海平面可能範圍的高端，是觀察高度影響的概略值，不代表台灣各地的局部變化。",
    understandFive: "<strong>+5 m：</strong>對應 2°C 峰值升溫下、約 2,000 年海平面承諾上升 2–6 m 的長期範圍（低信心），不是 2100 年或特定 SSP 預測。AR6 另指出 SSP5-8.5 下 2150 年接近 5 m 的結果屬於不能排除的低信心高端結果，兩者不可混為同一項預測。",
    understandIce: "<strong>+7.4、+58、+66 m：</strong>冰蓋或全球陸地冰完全融化的全球平均海平面等效高度概估，不表示具體融化路徑或時間。",
    understandLgm: "<strong>−120 m：</strong>末次冰盛期古海平面示意，不是未來情境。",
    limitationsTitle: "地圖模型與限制",
    limitationsOne: "正值標示 DEM 高程高於現今海平面、但低於設定高度的區域；負值標示現今海平面以下、可能曾曝露的區域。這些只是<strong>依地勢高度標示的可能影響區，不等於實際淹水範圍</strong>。",
    limitationsTwo: "模型未納入堤防、潮汐、風暴潮、河川、地下排水、水體連通性及地層升降。冰蓋完全融化的數值是全球平均海平面等效高度概估，不能直接解讀為台灣各地的局部海平面變化。因此結果<strong>不能作為防災、工程或不動產判斷依據</strong>。",
    sourcesTitle: "評估資料來源",
    baseMap: "底圖",
    elevation: "高程",
    localBaseMapCredit: "Tiles © Esri（本機備援底圖）",
    onlineBaseMapCredit: "© OpenStreetMap contributors",
  },
  en: {
    pageTitle: "Sea Level Change Map",
    metaDescription: "Interactive global sea-level change scenario map",
    brand: "Sea Level Change Map",
    brandAria: "Sea Level Change Map home",
    languageLabel: "Interface language",
    aboutButton: "About",
    mapAria: "Interactive sea-level map",
    controlsAria: "Sea-level scenario controls",
    controlsTitle: "SEA LEVEL / SCENARIO",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    sliderLabel: "Custom height (not a climate projection)",
    scenarioGroupAria: "Select a sea-level scenario",
    legendAria: "Legend",
    possibleFlood: "Potentially affected area",
    possibleExposure: "Potential exposed land",
    presentLand: "Present-day land",
    loadingElevation: "Loading elevation data…",
    calculating: (count) => `Calculating elevation overlay (${count})…`,
    loadError: "Elevation data could not be loaded. Check your connection.",
    updated: "Elevation overlay updated",
    tileError: "Elevation tile failed to load",
    currentSeaAria: "Present-day sea level",
    levelAria: (negative, value) => `Sea level ${negative ? "fall" : "rise"} of ${value} metres`,
    customDescription: "Custom sea-level comparison height; this is not output from an SSP climate model.",
    close: "Close",
    aboutEyebrow: "ABOUT THE MODEL",
    aboutTitle: "Sea-Level Height Impact Illustration",
    aboutLead: "This website compares a digital elevation model (DEM) with a sea-level height selected by the user. It <strong>does not calculate climate change or predict future sea level</strong>. IPCC data provide climate-assessment context; the slider is not climate-model output linked to an SSP scenario.",
    ipccTitle: "IPCC climate projection scenarios",
    sspIntro: "<strong>Shared Socioeconomic Pathways (SSPs)</strong> describe different socioeconomic, emissions, and policy futures used to explore possible climate responses. They are neither definite predictions nor statements of probability.",
    sspNaming: "The number before the hyphen identifies the socioeconomic pathway. The number after it indicates the approximate radiative forcing level around 2100, in W/m²; it is <strong>not degrees of warming or metres of sea-level rise</strong>. One SSP family can be paired with different emissions and policy pathways, such as SSP1-1.9 and SSP1-2.6. The five scenarios below are the core illustrative scenarios used in AR6, not a complete one-per-family list.",
    tableAria: "Comparison of the core IPCC AR6 SSP scenarios; scroll horizontally if needed",
    tableCaption: "Five core illustrative scenarios in IPCC AR6",
    scenarioColumn: "Scenario",
    forcingColumn: "Radiative forcing<br />around 2100",
    warmingColumn: "2081–2100 global warming<br /><small>relative to 1850–1900</small>",
    seaLevelColumn: "Global mean sea-level rise in 2100<br /><small>relative to 1995–2014</small>",
    temp119: "1.4°C (1.0–1.8°C)",
    temp126: "1.8°C (1.3–2.4°C)",
    temp245: "2.7°C (2.1–3.5°C)",
    temp370: "3.6°C (2.8–4.6°C)",
    temp585: "4.4°C (3.3–5.7°C)",
    tableNote: "Temperature values are best estimates (very likely ranges in parentheses); sea-level values are likely ranges. The two columns use different reference periods.",
    understandTitle: "How to interpret the preset heights",
    understandOne: "<strong>+1 m:</strong> Near the upper end of the likely 2100 global mean sea-level range across the five core AR6 scenarios. It is a rounded height for exploring terrain, not a local projection for every part of Taiwan.",
    understandFive: "<strong>+5 m:</strong> A value within the 2–6 m committed global mean rise over about 2,000 years if warming peaks at about 2°C (low confidence). It is not a 2100 or scenario-specific projection. AR6 separately notes that a rise approaching 5 m by 2150 under SSP5-8.5 is a low-confidence high-end outcome that cannot be ruled out; these are not the same projection.",
    understandIce: "<strong>+7.4, +58, and +66 m:</strong> Approximate global mean sea-level equivalents for complete melting of ice sheets or all land ice. They do not specify a pathway or timescale.",
    understandLgm: "<strong>−120 m:</strong> A Last Glacial Maximum palaeo-sea-level illustration, not a future scenario.",
    limitationsTitle: "Map method and limitations",
    limitationsOne: "Positive values mark DEM cells above present sea level but below the selected height; negative values mark areas below present sea level that may have been exposed. These are <strong>potentially affected areas based only on elevation, not actual flood extents</strong>.",
    limitationsTwo: "The model does not include levees, tides, storm surge, rivers, drainage, hydrological connectivity, or vertical land movement. Complete-melt values are approximate global mean sea-level equivalents and cannot be read directly as local sea-level change around Taiwan. The results <strong>must not be used for emergency planning, engineering, or property decisions</strong>.",
    sourcesTitle: "Assessment sources",
    baseMap: "Base map",
    elevation: "Elevation",
    localBaseMapCredit: "Tiles © Esri (local-file fallback)",
    onlineBaseMapCredit: "© OpenStreetMap contributors",
  },
};

const SCENARIO_TEXT = {
  "zh-Hant": {
    current: { title: "目前海平面基準", type: "基準", description: "目前海平面基準；不套用上升或下降情境。" },
    one: { title: "本世紀末高端示意", type: "本世紀末投影", description: "IPCC AR6 評估的 2100 年全球平均海平面上升範圍，依五種核心 SSP 情境約為 0.28–1.01 m（相較 1995–2014）。+1 m 是方便觀察地形的概略示意值，不代表台灣各地都會上升 1 m。" },
    five: { title: "長期暖化承諾示意", type: "約 2,000 年尺度", description: "IPCC AR6 指出，若全球升溫峰值約為 2°C，其後約 2,000 年的全球平均海平面承諾上升約 2–6 m（低信心）。+5 m 是此長期範圍內的高度影響示意值，不代表特定 SSP 情境或 2100 年預測。" },
    greenland: { title: "格陵蘭冰蓋完全融化", type: "極端長期假想情境", description: "冰蓋完全融化後的全球平均海平面等效高度概估；不表示融化時間，也不是近期或本世紀的預測。" },
    antarctic: { title: "南極冰蓋完全融化", type: "極端長期假想情境", description: "冰蓋完全融化後的全球平均海平面等效高度概估，屬於極端長期假想情境，不是本世紀預測。" },
    allIce: { title: "全球陸地冰完全融化", type: "極端長期假想情境", description: "全球陸地冰完全融化後的海平面等效高度概估；不代表具體融化路徑、時間或預測結果。" },
    lgm: { title: "末次冰盛期海平面", type: "古海平面情境", description: "海平面比現今低約 120 m 時的古海平面地勢示意，用來觀察現今海面下可能露出的地形，不是未來情境。" },
  },
  en: {
    current: { title: "Present-day sea level", type: "Baseline", description: "Present-day sea-level baseline; no rise or fall scenario is applied." },
    one: { title: "High-end 2100 illustration", type: "End-of-century projection", description: "Across the five core SSP scenarios, IPCC AR6 assesses likely global mean sea-level rise in 2100 at about 0.28–1.01 m relative to 1995–2014. +1 m is a rounded value for exploring terrain; it does not mean every location in Taiwan will experience a 1 m rise." },
    five: { title: "Long-term warming commitment", type: "About 2,000 years", description: "IPCC AR6 assesses a committed global mean sea-level rise of about 2–6 m over roughly 2,000 years if warming peaks at about 2°C (low confidence). +5 m illustrates terrain within this long-term range; it is not a specific SSP scenario or a 2100 projection." },
    greenland: { title: "Complete Greenland melt", type: "Extreme long-term hypothetical", description: "An approximate global mean sea-level equivalent if the Greenland Ice Sheet melted completely. It gives no melting timescale and is not a near-term or end-of-century projection." },
    antarctic: { title: "Complete Antarctic melt", type: "Extreme long-term hypothetical", description: "An approximate global mean sea-level equivalent if the Antarctic Ice Sheet melted completely. This is an extreme long-term hypothetical scenario, not an end-of-century projection." },
    allIce: { title: "Complete melt of all land ice", type: "Extreme long-term hypothetical", description: "An approximate sea-level equivalent if all land ice melted completely; it does not represent a specific pathway, timescale, or projection." },
    lgm: { title: "Last Glacial Maximum", type: "Palaeo-sea-level scenario", description: "An illustration of terrain when sea level was about 120 m below today, showing areas of the present seafloor that may have been exposed. This is not a future scenario." },
  },
};

function detectLanguage() {
  try {
    const saved = localStorage.getItem("seaLevelLanguage");
    if (saved === "zh-Hant" || saved === "en") return saved;
  } catch (_) {
    // Some browsers restrict storage for local files; browser language still works.
  }
  return (navigator.languages?.[0] || navigator.language || "en").toLowerCase().startsWith("zh") ? "zh-Hant" : "en";
}

let currentLanguage = detectLanguage();

function text(key) {
  return I18N[currentLanguage][key];
}

const map = L.map("map", {
  center: [23.7, 121],
  zoom: 7,
  minZoom: 2,
  maxZoom: 13,
  zoomControl: false,
  worldCopyJump: true,
});

L.control.zoom({ position: "topright" }).addTo(map);

const isLocalFile = window.location.protocol === "file:";
const baseMap = isLocalFile
  ? {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>',
      credit: "Tiles © Esri（本機備援底圖）",
    }
  : {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      credit: "© OpenStreetMap contributors",
    };

L.tileLayer(baseMap.url, {
  maxZoom: 19,
  attribution: baseMap.attribution,
}).addTo(map);

document.getElementById("baseMapCredit").textContent = baseMap.credit;

function scenarioText(button) {
  return SCENARIO_TEXT[currentLanguage][button.dataset.scenario];
}

function updateSliderAria(level) {
  const negative = level < 0;
  const value = formatLevel(Math.abs(level));
  document.getElementById("levelSlider").setAttribute(
    "aria-valuetext",
    level === 0 ? text("currentSeaAria") : text("levelAria")(negative, value),
  );
}

function applyLanguage(language, persist = true) {
  currentLanguage = language === "zh-Hant" ? "zh-Hant" : "en";
  document.documentElement.lang = currentLanguage;
  document.title = text("pageTitle");
  document.getElementById("metaDescription").content = text("metaDescription");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = text(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = text(element.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", text(element.dataset.i18nAria));
  });

  document.querySelectorAll(".scenario").forEach((button) => {
    const copy = scenarioText(button);
    button.dataset.label = copy.title;
    button.dataset.description = copy.description;
    button.querySelector(".scenario-name").innerHTML = `${copy.title}<small>${copy.type}</small>`;
    button.setAttribute("aria-label", `${button.querySelector(".scenario-value").textContent}, ${copy.title}, ${copy.type}`);
  });

  const activeButton = document.querySelector(".scenario.active");
  document.getElementById("scenarioDescription").textContent = activeButton
    ? scenarioText(activeButton).description
    : text("customDescription");
  document.getElementById("legendLabel").textContent = state.level < 0
    ? text("possibleExposure")
    : text("possibleFlood");
  document.getElementById("baseMapCredit").textContent = isLocalFile
    ? text("localBaseMapCredit")
    : text("onlineBaseMapCredit");
  document.getElementById("languageSelect").value = currentLanguage;
  const zoomIn = document.querySelector(".leaflet-control-zoom-in");
  const zoomOut = document.querySelector(".leaflet-control-zoom-out");
  if (zoomIn) {
    zoomIn.title = text("zoomIn");
    zoomIn.setAttribute("aria-label", text("zoomIn"));
  }
  if (zoomOut) {
    zoomOut.title = text("zoomOut");
    zoomOut.setAttribute("aria-label", text("zoomOut"));
  }
  updateSliderAria(state.level);
  updateStatus();

  if (persist) {
    try {
      localStorage.setItem("seaLevelLanguage", currentLanguage);
    } catch (_) {
      // Language switching still works when local storage is unavailable.
    }
  }
}

const ElevationLayer = L.GridLayer.extend({
  createTile(coords, done) {
    const generation = this.options.generation;
    const canvas = L.DomUtil.create("canvas", "elevation-tile");
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const image = new Image();
    image.crossOrigin = "anonymous";

    if (generation === state.generation) {
      state.pending += 1;
      updateStatus();
    }

    image.onload = () => {
      try {
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
        paintElevationMask(pixels.data, state.level);
        context.putImageData(pixels, 0, 0);
        if (generation === state.generation) state.loaded += 1;
        done(null, canvas);
      } catch (error) {
        if (generation === state.generation) state.failed += 1;
        done(error, canvas);
      } finally {
        if (generation === state.generation) {
          state.pending -= 1;
          updateStatus();
        }
      }
    };

    image.onerror = () => {
      if (generation === state.generation) {
        state.pending -= 1;
        state.failed += 1;
        updateStatus();
      }
      done(new Error(text("tileError")), canvas);
    };

    image.src = `https://elevation-tiles-prod.s3.amazonaws.com/terrarium/${coords.z}/${coords.x}/${coords.y}.png`;
    return canvas;
  },
});

function paintElevationMask(data, level) {
  const rising = level >= 0;
  for (let index = 0; index < data.length; index += 4) {
    const elevation = data[index] * 256 + data[index + 1] + data[index + 2] / 256 - 32768;
    const selected = rising
      ? elevation > 0.25 && elevation <= level
      : elevation > level && elevation <= -0.25;

    if (selected) {
      if (rising) {
        data[index] = 0;
        data[index + 1] = 125;
        data[index + 2] = 174;
        data[index + 3] = 188;
      } else {
        data[index] = 218;
        data[index + 1] = 170;
        data[index + 2] = 83;
        data[index + 3] = 205;
      }
    } else {
      data[index + 3] = 0;
    }
  }
}

let elevationLayer = new ElevationLayer({
  tileSize: TILE_SIZE,
  opacity: 0.92,
  generation: state.generation,
  attribution: ELEVATION_ATTRIBUTION,
}).addTo(map);

function updateLayer() {
  state.generation += 1;
  state.pending = 0;
  state.loaded = 0;
  state.failed = 0;
  map.removeLayer(elevationLayer);
  elevationLayer = new ElevationLayer({
    tileSize: TILE_SIZE,
    opacity: 0.92,
    generation: state.generation,
    attribution: ELEVATION_ATTRIBUTION,
  }).addTo(map);
}

function updateStatus() {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  dot.className = "status-dot";

  if (state.pending > 0) {
    text.textContent = I18N[currentLanguage].calculating(state.pending);
  } else if (state.failed > 0 && state.loaded === 0) {
    dot.classList.add("error");
    text.textContent = I18N[currentLanguage].loadError;
  } else {
    dot.classList.add("ready");
    text.textContent = I18N[currentLanguage].updated;
  }
}

function formatLevel(level) {
  return Number.isInteger(level) ? String(level) : level.toFixed(1);
}

function updateLevelInterface(level, label, activeButton = null) {
  state.level = level;
  document.querySelectorAll(".scenario").forEach((item) => {
    const active = item === activeButton;
    item.classList.toggle("active", active);
    item.setAttribute("aria-checked", String(active));
  });

  const negative = level < 0;
  document.getElementById("levelSign").textContent = negative ? "−" : "+";
  document.getElementById("levelValue").textContent = formatLevel(Math.abs(level));
  document.getElementById("scenarioDescription").textContent = label;
  document.getElementById("legendLabel").textContent = negative ? text("possibleExposure") : text("possibleFlood");
  document.querySelector(".legend-swatch.flood").style.background = negative
    ? "rgba(218, 170, 83, .8)"
    : "rgba(0, 128, 171, .72)";
  const slider = document.getElementById("levelSlider");
  slider.value = level;
  updateSliderAria(level);
}

function selectScenario(button) {
  clearTimeout(sliderTimer);
  updateLevelInterface(Number(button.dataset.level), button.dataset.description || button.dataset.label, button);
  updateLayer();
}

document.querySelectorAll(".scenario").forEach((button) => {
  button.addEventListener("click", () => selectScenario(button));
});

const levelSlider = document.getElementById("levelSlider");
levelSlider.addEventListener("input", () => {
  const level = Number(levelSlider.value);
  const matchingPreset = [...document.querySelectorAll(".scenario")].find(
    (button) => Number(button.dataset.level) === level,
  );
  updateLevelInterface(
    level,
    matchingPreset?.dataset.description || text("customDescription"),
    matchingPreset || null,
  );
  clearTimeout(sliderTimer);
  sliderTimer = setTimeout(updateLayer, 180);
});

levelSlider.addEventListener("change", () => {
  clearTimeout(sliderTimer);
  updateLayer();
});

map.on("mousemove", ({ latlng }) => {
  const lat = `${Math.abs(latlng.lat).toFixed(2)}°${latlng.lat >= 0 ? "N" : "S"}`;
  const lng = `${Math.abs(latlng.lng).toFixed(2)}°${latlng.lng >= 0 ? "E" : "W"}`;
  document.getElementById("coordinates").textContent = `${lat} · ${lng}`;
});

const dialog = document.getElementById("aboutDialog");
document.getElementById("aboutButton").addEventListener("click", () => dialog.showModal());
document.getElementById("closeAbout").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.getElementById("languageSelect").addEventListener("change", (event) => {
  applyLanguage(event.target.value);
});

applyLanguage(currentLanguage, false);
