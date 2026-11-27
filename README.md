# 海平面變化地圖

一個以公開 DEM 高程圖磚即時計算的互動式海平面情境地圖。

除了七個預設情境，也可使用水平滑桿在 −120 m 至 +66 m 之間，以 0.1 m 精度自訂海平面。

介面支援繁體中文與英文。首次開啟時會依瀏覽器預設語言自動選擇，也可使用頁面右上角的選單手動切換；手動選擇會儲存在瀏覽器中。

## 線上使用

**[開啟海平面變化地圖](https://xun73.github.io/sea-level-map/)**

不需下載或安裝，使用電腦或手機瀏覽器即可進入。線上版本使用 OpenStreetMap 底圖。

## 下載單機版

**[下載最新版單機版 ZIP](https://github.com/xun73/sea-level-map/releases/latest/download/sea-level-map-standalone.zip)**

也可以前往 [Releases 頁面](https://github.com/xun73/sea-level-map/releases/latest)，展開 **Assets** 後下載 `sea-level-map-standalone.zip`。

### 使用方式

1. 下載 `sea-level-map-standalone.zip`。
2. 將 ZIP **完整解壓縮**，不要直接在壓縮檔內開啟網頁。
3. 保留 `index.html`、`app.js`、`styles.css` 與 `vendor` 資料夾的相對位置。
4. 在有網路連線時雙擊 `index.html`，即可使用瀏覽器開啟地圖。

單機版不需安裝 Python、Node.js 或網頁伺服器。Leaflet 程式庫已包含在下載檔內，但底圖與高程圖磚仍需由網路載入，因此不是完全離線版本。

### 底圖選擇

地圖右上角的圖層按鈕可切換底圖：

- **GitHub 線上版：**OpenStreetMap 標準地圖（預設）、Esri 街道圖、Esri 地形圖、Esri 衛星影像。
- **單機版：**Esri 街道圖（預設）、Esri 地形圖、Esri 衛星影像。

單機版不列出 OpenStreetMap，是因為 OpenStreetMap 官方圖磚會限制從 `file://` 本機頁面直接存取；線上版則保留 OpenStreetMap 為預設底圖。

### 無法直接開啟時

若所使用的瀏覽器或公司安全政策禁止本機網頁連線外部圖磚，可改用本機 HTTP 伺服器：

```powershell
python -m http.server 8000
```

然後開啟 <http://localhost:8000>。

## 情境

- +0 m：目前海平面基準
- +1 m：本世紀末高端示意
- +5 m：長期暖化承諾示意（約 2,000 年尺度，低信心）
- +7.4 m：格陵蘭冰原完全融化的極端長期假想情境
- +58 m：南極冰原完全融化的極端長期假想情境
- +66 m：全球陸地冰完全融化的極端長期假想情境
- −120 m：末次冰盛期古海平面示意

## 方法與限制

正值會標出 DEM 高程大於現今海平面且低於情境高度的像素；負值則標出海平面以下、情境海平面以上的像素。這是海平面高度影響示意，不會計算水體連通性，也未納入堤防、潮汐、風暴潮、河流、排水或地層下陷，不能作為防災或工程依據。

網站內的 IPCC AR6 SSP 表格只提供氣候評估背景；高度滑桿並非與 SSP 連動的氣候模型輸出。溫度推估以 1850–1900 為基準，2100 年全球平均海平面推估以 1995–2014 為基準。

IPCC AR6 參考：[WGI Summary for Policymakers](https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/)、[WGI Chapter 9](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/)、[Synthesis Report Summary for Policymakers](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/)。

資料來源：© OpenStreetMap contributors；本機備援底圖 Tiles © Esri；Mapzen / AWS Terrain Tiles。
