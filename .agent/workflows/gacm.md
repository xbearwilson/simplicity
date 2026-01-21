---
description: 建立含日期的繁體中文 Git Commit 並可選 Push
---

1.  **Get Date**: Obtain the current date in `YYYYMMDD` format (e.g., `20251225`).
2.  **Analyze Context**: Review the recent conversation history and file modifications to summarize the key changes made in this session.
3.  **Draft Message**: Create a concise, Traditional Chinese summary of the tasks completed.
4.  **Detect Repository Status**: Check if a remote git repository exists by running `git remote`.
5.  **Format Command**: Construct the terminal command using the user's custom alias `gacm`.
    - Format: `bash -ic "gacm '[YYYYMMDD] <summary>'"`
6.  **Ask for Confirmation**: Display the command and ask the user "執行此 commit 指令？(y/n)"
7.  **Execute Command**: If confirmed, use the `run_command` tool to execute the command.
8.  **Conditional Push**:
    - If a remote repository was detected in Step 4, ask the user: "是否需要執行『將目前已完成的 git commit push 到遠端 git repository』？(y/n)"
    - If confirmed (y/yes), execute `git push`.
    - If no remote repo was detected in Step 4, skip this step.
