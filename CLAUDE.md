# simplicity

## 勿刪資產
`public/` 下 `A3_1.webp`、`A3_2.webp`、`A3_3.webp`、`A3_4.webp`、`newItem.webp`、`post.webp`、`hot.webp` 為外部連結／行銷用，`src/` 無引用但**不是未使用**。
- 禁止在「清理未使用資源」時刪除（A3_1-4、newItem 曾於 b14b493、0984e6f 誤刪兩次）。
- 清單單一來源：`scripts/protected-assets.mjs`；`pnpm build` 會檢查，缺檔即失敗。
- 刪除前先 `git grep` 外部使用處並經使用者確認。
