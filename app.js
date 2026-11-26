/* global L */

const state = { level: 1, pending: 0, loaded: 0, failed: 0, generation: 0 };
const TILE_SIZE = 256;
const ELEVATION_ATTRIBUTION = 'Elevation: <a href="https://registry.opendata.aws/terrain-tiles/">Mapzen/AWS</a>';
let sliderTimer;

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
      done(new Error("高程圖磚載入失敗"), canvas);
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
    text.textContent = `正在計算高程遮罩（${state.pending}）…`;
  } else if (state.failed > 0 && state.loaded === 0) {
    dot.classList.add("error");
    text.textContent = "高程資料無法載入，請檢查網路連線";
  } else {
    dot.classList.add("ready");
    text.textContent = "高程遮罩已更新";
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
  document.getElementById("legendLabel").textContent = negative ? "可能曝露陸地" : "可能淹沒區";
  document.querySelector(".legend-swatch.flood").style.background = negative
    ? "rgba(218, 170, 83, .8)"
    : "rgba(0, 128, 171, .72)";
  const slider = document.getElementById("levelSlider");
  slider.value = level;
  slider.setAttribute(
    "aria-valuetext",
    level === 0 ? "目前海平面" : `海平面${negative ? "下降" : "上升"} ${formatLevel(Math.abs(level))} 公尺`,
  );
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
    matchingPreset?.dataset.description || "自訂地形門檻高度；此數值不是 SSP 氣候模型輸出。",
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

updateStatus();
