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

src/App.jsx 中的 品項分類 下拉選單，已新增 "新品項 New"，且邏輯正常顯示符合條件的商品
但是點選後，在選單右方卻出現"目前暫無品項"，請立刻修改
其他選項正常

gacm '[20251226]update info 藜麥,超麥'

## 20251228

需求：public/ webp 圖片 上傳部署時自動加入 watermark.webp 浮水印
原因：因為之前有請你處理過圖片 SEO 優化，所以希望在部署時自動加入 watermark.webp 浮水印，提高圖片辨識度
你已修改 vite.config.js 1.自動定位 很好，能更改為隨機"左上角"、"右上角"、"左下角"、"右下角" 2.我執行 pnpm p 發佈預覽，沒還是有看見圖片加上浮水印效果，我已修改 vite.config.js:25 將原 public/logo.svg 改為 public/watermark.webp

請以最小&最基本 token 額度 執行，不要一直失敗，浪費我的 token 額度 1.我執行 pnpm p 發佈預覽，還是沒有看見圖片加上浮水印效果
2.DEV 模式不需要圖片加上浮水印效果，圖片加上浮水印效果僅在 PUBLICATION 模式下生效 3.你的測試應該是 PUBLICATION 模式下，pnpm b or pnpm p 4.你既然回答我完成，我執行 pnpm p 發佈預覽為何會有錯誤產生?

1.浮水印已更新為 35% 大小，vite.config.js 在哪一行設定? 太大了，我需要手動調整 2.大部分圖片確實有加上浮水印效果，還是有少數圖片沒有加上浮水印效果，請立刻修改

## 20251229

gacm '[20251229]Remove logo.svga a# tag & add alt & title'

## 20260109

告訴我"我今天 20251225 會在 src/inventory.js 新增 9 項商品內容"，在那一個對話紀錄中，我自己要讀邏輯寫法+日後我自己該如何操作

1.所以我覺得奇怪，雖然 src/inventory.js 第 11 行定義了 NEW_DISPLAY_MONTHS = 6，但目前 src/App.jsx 內部的邏輯，並沒有引入 src/inventory.js 中的 NEW_DISPLAY_MONTHS 變數，而是硬編碼 (Hardcoded) 為 2 個月。 2.我希望日後由 src/inventory.js 第 11 行定義了 NEW_DISPLAY_MONTHS = 6 統一修改，將 App.jsx 中的 2 改為引用該變數。

gacm '[20260109]1.改縮網址：srt.tw 2.同步新品項顯示期限邏輯，改由 inventory.js 統一控制'

gacm '[20260111]1.src/App.jsx:337 +2px 2.mxw(xs) .top, .logo, .view-all'

## 20260119

gacm '[20260119] 建立 Senior 執行協議並更新 GSAP 2025 規範'

<!--  -->

## 20260121

@.agent/workflows/gacm.md /gacm 指令主要是請你幫我建立我和你的階段性任務的git commit，我想加入執行步驟：1.在步驟4.時，請你另外先偵測這個開發環境下，是否已經存在遠端的git repository，如果存在遠端的git repository，請在步驟7.執行完成後，詢問我是否需要執行 y/n 步驟8."將目前已完成的 git commit push 到遠端 git repository"。2.在步驟4.時，偵測這個開發環境下，沒有已經存在遠端的git repository，請在步驟7.執行完成後，直接忽略取消 步驟8."將目前已完成的 git commit push 到遠端 git repository" (因為這個開發環境下，沒有已經存在遠端的git repository)。3.我需要給妳什麼資訊，來新增這個邏輯?

但是我在 @.agent/workflows/gacm.md 沒有看見
更新內容：
步驟 4 (偵測環境)：新增了偵測遠端 git repository 的邏輯（透過執行 git remote）。
步驟 8 (條件式 Push)：
如果在步驟 4 有偵測到遠端倉庫，在完成 commit 後會詢問您是否執行 push。
如果沒有偵測到遠端倉庫，則會自動忽略並取消此步驟。

了解，因為在 @.agent/workflows/gacm.md 沒有看見這些邏輯或git指令，所以才會詢問你
你確定新增了這個遠端git repository邏輯就好，你真棒

所以，我將 @.agent/workflows/gacm.md 複製到其他開發環境下，你也會執行「偵測遠端倉庫」的動作，並且在詢問 commit 後，是否會接著問我「是否需要 push 到遠端」?

我重新開啟了IDE，還是一樣，我在和你的對話框中，輸入 / ，並沒有顯示能執行的指令集合(顯示 No results)，而且無法執行 /gacm 指令

我測試了其他開發環境下，我在和你的對話框中，輸入 / ，卻能顯示能執行的指令集合，而且能呼叫執行 /gacm 指令，唯獨這個開發環境下，卻無法顯示能執行的指令集合，無法呼叫執行 /gacm 指令

嘗試「觸發重新索引」 (最推薦)會有檔案丟失的風險嗎? 你執行後能回復正常嗎?
你確定能100%回復正常的狀態下，你直接幫我處理

@.agent/workflows 下，甚至是 @.agent 下，完全沒有使用中文命名呀

你查到是.gitignore 的 .agent/問題引起，所以你取消了.gitignore 的 .agent/，但是我加入它的用意是"我不希望 .agent/ 相關指令 被上傳到遠端"，有其他方式能達成嗎?

你意思是說，從現在開始 .agent/ 將只能被本地端git 追蹤加入本本控制，但是 .agent/ 將不會再被上傳到遠端嗎?

@.git/info/exclude .agent 告訴我該如何直接寫入 .gitconfig，避免每個開發環境都必須手動加入 @.git/info/exclude .agent

我已在 .gitignore_global 中加入 .agent，並移除了 @.git/info/exclude .agent & .gitignore .agent

## 待辦事項：

1.從 max width(md) 下 開始調整，max width(xs) 下 調整 .desc max-width ch，因為字多還是會被擋。

2.新增過年店休日

<!--  -->
