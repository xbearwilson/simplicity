建立此工作階段的中文簡短 commit message
格式：gacm '[20251208]commit message'

gacm '[20251201][圖片優化與配置清理]

- 將所有圖片轉換為 WebP 格式(減少 20-35% 檔案大小)
- 變更部分圖片為 w400px 50% 質量
- 新增圖片優化腳本,支援自動轉換
- 移除未使用的依賴套件(vite-plugin-purgecss、postcss-nesting)
- 清理 vite.config.js 和 postcss.config.cjs
- 隱藏 IE grid autoprefixer 警告訊息
- 更新 browserslist 資料庫
- 更新 inventory.js 改用 .webp 圖片路徑
- 更新 package.json 腳本命令'

gacm '[20251203]智能 Preloader - 根據快取與瀏覽階段動態調整載入時間'
gacm '[20251205]Preloader 改為實際圖片載入進度偵測, 所有 webp 優化為 w400px 50% 質量'

請動態偵測 src/App.scss:106 .top 的高度
再將 src/App.scss:300 .main 全部的 @media @include 中的 margin-top 調整為 src/App.scss:106 .top 的高度，但要絕對保證語法在 Reactjs 初始 DOM 下載完成後執行，避免 margin-top 未定義或錯誤

## 20251225

我今天 20251225 會在 src/inventory.js 新增 9 項商品內容，若是我想要這 9 項商品在畫面上多出 NEW 明顯字樣，可看見 NEW 期間為 2 個月，2 個月(我自己能增加或減少的變數)後即消失，我該手動增加 src/inventory.js 的 newPeriod 變數嗎?

我已手動增加 src/inventory.js:133 的 addedDate 準備測試效果，其餘的修改請你立刻執行
所以從此以後，我只需要增加 addedDate: '開始日期'即可出現 NEW 字樣，是嗎?

更改 src/inventory.js 的 id 由上到下重新編號

src/App.jsx 中的 品項分類 下拉選單，請新增 "新品項 New" 並置於最上端，顯示邏輯是 src/inventory.js 中的 addedDate
品項分類 下拉選單，已新增 "新品項 New"，但是點選後是空白，無顯示符合條件商品，請立刻修改

## 20251226

src/App.jsx:115 為何 scrollToTop 使用 src/App.jsx:1 Lenis 無效，請立刻修改
src/App.jsx:24 IDE 回報未使用，能移除嗎?
