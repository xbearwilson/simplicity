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

1.希望網站的所有圖片能被 Google 搜尋引擎索引和顯示，並且每個商品的圖片都能被索引和顯示，滑鼠移動在圖片上時，能夠顯示圖片的 alt 屬性"商品名稱 中英文"，請立刻修改 2.希望滑鼠移動在 scrollToTop 按鈕時，能夠顯示 "回上方 TOP"。

1.檢視 public/robots.txt，讓內容符合 Google 搜尋引擎索引和顯示的設定 2.補充其它增強 SEO 的設定，這個開發環境是上傳 github + vercel 部屬 3.加強 AI 搜尋引擎索引和顯示的設定

1.在 .agent/workflows 建立指令，例如: /seo 指令，在我和你對話視窗輸入此指令，讓此開發環境自動執行全站 SEO & AI 搜尋引擎檢查並優化，全站圖片 alt & title 屬性 SEO 優化，並檢查補充 SEO & AI 搜尋引擎 缺少的部分。 2.目標為網站建立具備現代化、AI 友善的 SEO 完整全套基礎架構。

工作流程指令有包含自動檢查並建立嗎?
Vercel 伺服器優化?
Github 伺服器優化?
SEO & AI 搜尋引擎友善優化?
public/robots.txt?
：
✅ 明確允許 Googlebot 和 Googlebot-Image 爬取，確保圖片能被索引。
✅ 特別允許 GPTBot 和 ChatGPT-User，這對 AI 搜尋引擎非常重要。
✅ 指定了 Sitemap 的正確位置。
public/sitemap.xml?
：
✅ 更新了 lastmod 日期，通知搜尋引擎網站已有更新。
✅ 加入了 changefreq 和 priority 屬性，建議爬蟲每週來訪。
index.html?
：
✅ 移除 noimageindex：這是關鍵，之前這個設定阻止了 Google 索引您的圖片。現在圖片可以被正常搜尋到了。
✅ 修正 OG Image：將原本指向不存在的 .png 修正為正確的
.webp
，確保在社群分享時能顯示預覽圖。
✅ 加入 Schema.org 結構化資料：這是一段 JSON-LD 程式碼，直接告訴搜尋引擎這是一間「麵包店 (Bakery)」，並提供了地址、電話、營業時間等詳細資訊。這對 AI 搜尋引擎理解您的業務至關重要?
✅ 加入 Canonical Link：防止網址參數造成的重複內容問題?
工作流程指令內容希望是全面的完整地 SEO & AI 搜尋引擎友善優化。

目前的環境是否已符合工作流程指令內容?

並且在 /seo 工作流程指令內容也要加入你做過的這些檢查內容，確保只要執行 /seo 就能建立具備現代化、AI 友善的 SEO、Vercel 伺服器優化、
Github 伺服器優化、
SEO & AI 搜尋引擎友善優化的完整全套基礎架構

/seo 工作流程 是否包含 檢查頁面 SEO (index.html)並自動優化?
/seo 工作流程 是否已符合現代化、AI 友善的 SEO、Vercel 伺服器優化、
Github 伺服器優化、
SEO & AI 搜尋引擎友善優化的完整全套基礎架構?
