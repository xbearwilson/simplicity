---
description: Convert conversation and task requirements to TOON format (Agent-driven)
---

1.  **Context Extraction**: I will analyze our conversation history and your current task requirements.
2.  **JSON Generation**: Since the `gemini` CLI is currently unavailable due to npm registry errors, I will manually structure this information into a `requirements.json` file.
3.  **TOON Conversion**: I will then convert this JSON data into the TOON (Token-Oriented Object Notation) format, which uses indentation and minimal punctuation to save tokens.
4.  **Ask for Confirmation**: Display the generated files and ask "儲存這些檔案？(y/n)"
5.  **Wait for Response**: Only proceed if the user responds with 'y' or 'yes'
6.  **Save Output**: If confirmed, save the result to `requirements.json` and `requirements.toon` and display the content for you to copy.
