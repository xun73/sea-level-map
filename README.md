# 海平面變化地圖

一個以公開 DEM 高程圖磚即時計算的互動式海平面情境地圖。

除了七個預設情境，也可使用水平滑桿在 −120 m 至 +66 m 之間，以 0.1 m 精度自訂海平面。

介面支援繁體中文與英文。首次開啟時會依瀏覽器預設語言自動選擇，也可使用頁面右上角的選單手動切換；手動選擇會儲存在瀏覽器中。

## 線上使用

**[開啟海平面變化地圖](https://xun73.github.io/sea-level-map/)**

不需下載或安裝，使用電腦或手機瀏覽器即可進入。線上版本使用 OpenStreetMap 底圖。

## 本機啟動

有網路連線時，可直接雙擊 `index.html` 開啟。Leaflet 程式庫已包含在專案內；底圖與高程圖磚仍會由網路載入。網站版本使用 OpenStreetMap；直接開啟本機檔案時，為避免 OpenStreetMap 的 `file://` 存取限制，會自動改用 Esri 備援底圖。

若所使用的瀏覽器或公司安全政策禁止本機網頁連線外部圖磚，可改用本機 HTTP 伺服器：

```powershell
python -m http.server 8000
```

然後開啟 <http://localhost:8000>。

## 情境

- +0 m：目前海平面基準
- +1 m：本世紀末高端示意
- +5 m：長期暖化承諾示意（約 2,000 年尺度，低信心）
- +7.4 m：格陵蘭冰蓋完全融化的極端長期假想情境
- +58 m：南極冰蓋完全融化的極端長期假想情境
- +66 m：全球陸地冰完全融化的極端長期假想情境
- −120 m：末次冰盛期古海平面示意

## 方法與限制

正值會標出 DEM 高程大於現今海平面且低於情境高度的像素；負值則標出海平面以下、情境海平面以上的像素。這是海平面高度影響示意，不會計算水體連通性，也未納入堤防、潮汐、風暴潮、河流、排水或地層下陷，不能作為防災或工程依據。

網站內的 IPCC AR6 SSP 表格只提供氣候評估背景；高度滑桿並非與 SSP 連動的氣候模型輸出。溫度投影以 1850–1900 為基準，2100 年全球平均海平面投影以 1995–2014 為基準。

IPCC AR6 參考：[WGI Summary for Policymakers](https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/)、[WGI Chapter 9](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/)、[Synthesis Report Summary for Policymakers](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/)。

資料來源：© OpenStreetMap contributors；本機備援底圖 Tiles © Esri；Mapzen / AWS Terrain Tiles。
