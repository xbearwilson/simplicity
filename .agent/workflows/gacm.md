---
description: Generate a short Chinese commit message for the current session in the format gacm '[YYYYMMDD] message'
---

1.  **Get Date**: Obtain the current date in `YYYYMMDD` format (e.g., `20251225`).
2.  **Analyze Context**: Review the recent conversation history and file modifications to summarize the key changes made in this session.
3.  **Draft Message**: Create a concise, Traditional Chinese summary of the tasks completed.
4.  **Format Command**: Construct the terminal command using the user's custom alias `gacm`.
    - Format: `bash -ic "gacm '[YYYYMMDD] <summary>'"`
    - Example: `bash -ic "gacm '[20251225] 移植 ScrollUp 邏輯並修復 TypeScript 錯誤'"`
5.  **Ask for Confirmation**: Display the command and ask the user "執行此指令？(y/n)"
6.  **Wait for Response**: Only proceed if the user responds with 'y' or 'yes'
7.  **Execute Command**: If confirmed, use the `run_command` tool to execute the command
