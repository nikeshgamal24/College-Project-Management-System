# Converting Mermaid Diagrams to Images

This guide shows different ways to convert the Mermaid diagrams to image files (PNG, SVG, PDF) for use in documentation.

## Method 1: Online Tools (Easiest)

### Mermaid Live Editor
1. Go to [mermaid.live](https://mermaid.live/)
2. Copy the content from `ip-tracking-flow.mermaid`
3. Paste it into the editor
4. Click "Download" and choose format (PNG, SVG, PDF)

### Mermaid Ink (Direct URLs)
You can generate images directly using URLs:
```
https://mermaid.ink/img/base64encodeddiagram
```

## Method 2: Command Line Tools

### Install Mermaid CLI
```bash
npm install -g @mermaid-js/mermaid-cli
```

### Convert to PNG
```bash
mmdc -i docs/diagrams/ip-tracking-flow.mermaid -o docs/diagrams/ip-tracking-flow.png
```

### Convert to SVG
```bash
mmdc -i docs/diagrams/ip-tracking-flow.mermaid -o docs/diagrams/ip-tracking-flow.svg
```

### Convert with custom theme
```bash
mmdc -i docs/diagrams/ip-tracking-flow.mermaid -o docs/diagrams/ip-tracking-flow.png -t dark
```

## Method 3: VS Code Extensions

### Recommended Extensions:
1. **Mermaid Markdown Syntax Highlighting** - for syntax support
2. **Markdown Preview Mermaid Support** - for preview
3. **Mermaid Editor** - for editing and exporting

### Export Process:
1. Open the `.mermaid` file in VS Code
2. Use Command Palette (Ctrl+Shift+P)
3. Search for "Mermaid: Export"
4. Choose desired format

## Method 4: GitHub/GitLab (Automatic)

When you push to GitHub/GitLab, the Mermaid code in markdown files will automatically render as visual diagrams.

### Example Usage in Markdown:
```markdown
![IP Tracking Flow](./diagrams/ip-tracking-flow.png)
```

Or reference the live GitHub-rendered version:
```markdown
See the [IP Tracking Flow Diagram](./IP-Tracking-Rate-Limiting.md#ip-tracking-flow)
```

## Recommended Workflow

1. **Edit**: Use `.mermaid` files for source code
2. **Preview**: Use VS Code with Mermaid extensions
3. **Export**: Use mermaid.live for quick image generation
4. **Deploy**: Let GitHub/GitLab render automatically in markdown files

## File Structure
```
docs/
├── diagrams/
│   ├── ip-tracking-flow.mermaid     # Source code
│   ├── ip-tracking-flow.png         # Generated image (optional)
│   ├── ip-tracking-flow.svg         # Generated image (optional)
│   └── README.md                    # This documentation
└── IP-Tracking-Rate-Limiting.md     # Main documentation with embedded diagram
```
