請建立此工作階段的中文簡短 commit message
格式：gacm '[目前日期_格式：20251203]commit message'

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
