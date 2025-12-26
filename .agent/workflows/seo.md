---
description: 全站 SEO & AI 搜尋引擎優化與檢查 (含 Vercel/Github 優化)
---

# 全站 SEO & AI 搜尋引擎優化與伺服器設定工作流程

此工作流程旨在自動檢查並建立具備現代化、AI 友善的 SEO 完整基礎架構，並包含 Vercel 伺服器端優化與 Github 專案設定。

## 1. 伺服器與部署優化 (Vercel & Github)

1.  **檢查並建立 `vercel.json` (Vercel 伺服器優化)**
    - **目標**: 優化靜態資源快取與安全性。
    - **自動動作**: 若檔案不存在或設定不全，建立/更新包含以下設定的 `vercel.json`:
      - **Security Headers (針對 `/(.*)`)**:
        - `X-Content-Type-Options: nosniff`
        - `X-Frame-Options: DENY`
        - `X-XSS-Protection: 1; mode=block`
      - **Caching (針對 HTML)**: `Cache-Control: public, max-age=0, must-revalidate`
      - **Caching (針對圖片/JS/CSS)**: `Cache-Control: public, max-age=31536000, immutable`
2.  **檢查 `package.json` (Github 專案優化)**
    - **目標**: 確保專案元數據完整，有利於 Github 內部搜尋與 SEO。
    - **自動動作**: 檢查並補全以下欄位：
      - `description`: 專案簡介 (含品牌關鍵字)。
      - `keywords`: 相關關鍵字陣列。
      - `author`: 作者或組織名稱。
      - `homepage`: 部署後的網站網址。

## 2. 基礎架構檢查與建立 (Infrastructure)

1.  **檢查並修復 `public/robots.txt`**

    - **目標**: 引導 Google 與 AI 爬蟲。
    - **自動動作**: 確保內容包含：
      - ✅ `User-agent: Googlebot` (Allow: /)
      - ✅ `User-agent: Googlebot-Image` (Allow: /)
      - ✅ `User-agent: GPTBot` (Allow: /) - **AI 關鍵**
      - ✅ `User-agent: ChatGPT-User` (Allow: /) - **AI 關鍵**
      - ✅ `Sitemap: [完整 URL]/sitemap.xml`

2.  **檢查並修復 `public/sitemap.xml`**
    - **目標**: 提供最新的網站地圖。
    - **自動動作**: 確保內容包含：
      - ✅ `<lastmod>` 為近期日期。
      - ✅ `<changefreq>weekly</changefreq>`。
      - ✅ `<priority>1.0</priority>`。

## 3. 頁面級 SEO 與 AI 優化 (Page-Level SEO)

1.  **檢查並修復 `index.html`**
    - **Meta Tags 優化**:
      - ✅ **Canonical Link**: `<link rel="canonical" href="..." />`
      - ✅ **Googlebot**: `content` 中**嚴禁**包含 `noimageindex`。
      - ✅ **Author/Copyright**: 補全 `author` 和 `copyright` meta tags。
    - **Social Media (OG & Twitter)**:
      - ✅ **圖片格式**: `og:image` 和 `twitter:image` 必須指向 `.webp` 格式。
      - ✅ **路徑檢查**: 確保圖片檔案實際存在於 `public/` 資料夾中。
    - **AI 結構化資料 (Schema.org)**:
      - ✅ **JSON-LD**: 確保存在 `<script type="application/ld+json">`。
      - ✅ **內容完整性**: 必須包含 `@type` (如 Bakery), `name`, `description`, `image`, `telephone`, `address`, `openingHoursSpecification`。

## 4. 圖片 SEO 自動化 (Image SEO)

1.  **掃描全站組件 (JSX/TSX)**
    - **目標**: 確保所有商品圖片具備可索引的描述。
    - **自動動作**: 檢查所有 `<img>` 或 `LazyLoadImage` 標籤：
      - ✅ **Alt 屬性**: 自動加入 `alt={\`\${name} \${ename}\`}` (依據上下文)。
      - ✅ **Title 屬性**: 自動加入 `title={\`\${name} \${ename}\`}` 以提供滑鼠懸停提示。

## 5. 執行報告

1.  **總結**: 完成所有步驟後，列出已建立/更新的檔案和已修復的項目。
