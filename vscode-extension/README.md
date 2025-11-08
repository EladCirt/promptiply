# Promptiply for VSCode

Refine your AI prompts for better results with Copilot, Claude Code, Cursor, and more. Transform vague ideas into clear, actionable prompts using customizable profiles with smart topic tracking.

## ✨ Features

- **🔮 Prompt Refinement**: Transform casual prompts into clear, structured requests
- **👤 Customizable Profiles**: Tailor refinements to match your workflow (Technical Writer, Developer, etc.)
- **📊 Smart Topic Tracking**: Profiles evolve based on your usage patterns
- **💰 Economy/Premium Modes**: Choose speed & cost vs. quality
- **🆓 Multiple Modes**:
  - VSCode LM API (uses your Copilot subscription - **FREE**)
  - Ollama (local models - **FREE & Private**)
  - OpenAI API (pay-per-use)
  - Anthropic API (pay-per-use)
- **🎯 Flexible UI**: Inline replacement, diff view, or side panel
- **⌨️ Keyboard Shortcuts**: Fast refinement with `Ctrl+Shift+R`
- **🔄 Import/Export**: Share profiles across devices or with your team

## 🚀 Quick Start

1. **Install the extension**
2. **Select a profile** (click status bar or `Ctrl+Shift+Alt+P`)
3. **Write a prompt** in any file
4. **Select the text** and press `Ctrl+Shift+R` (or right-click → "Refine with Promptiply")
5. **Choose how to apply**: Inline, Webview, Diff, or Copy

## 📋 Requirements

**For VSCode LM mode (recommended):**
- GitHub Copilot subscription
- VSCode 1.85.0 or higher

**For Ollama mode:**
- [Ollama](https://ollama.ai) installed and running
- A model pulled (e.g., `ollama pull llama3.1:8b`)

**For API modes:**
- API key from OpenAI or Anthropic

## ⚙️ Configuration

Open Settings (`Cmd/Ctrl+,`) and search for "Promptiply":

```jsonc
{
  // Refinement mode
  "promptiply.mode": "vscode-lm", // or "ollama", "openai-api", "anthropic-api"

  // Use economy models (faster, cheaper)
  "promptiply.useEconomyModel": true,

  // VSCode LM settings
  "promptiply.vscodeLM.economyFamily": "gpt-3.5-turbo",
  "promptiply.vscodeLM.premiumFamily": "gpt-4o",

  // Ollama settings
  "promptiply.ollama.endpoint": "http://localhost:11434",
  "promptiply.ollama.economyModel": "llama3.2:3b",
  "promptiply.ollama.premiumModel": "llama3.1:8b",

  // UI preferences
  "promptiply.ui.defaultMode": "ask", // "inline", "webview", "diff", or "ask"

  // CodeLens (shows "Refine" buttons above prompts)
  "promptiply.codeLens.enabled": true
}
```

## 🎮 Commands

| Command | Keyboard Shortcut | Description |
|---------|------------------|-------------|
| `Promptiply: Refine Selection` | `Ctrl+Shift+R` | Refine selected text |
| `Promptiply: Switch Profile` | `Ctrl+Shift+Alt+P` | Change active profile |
| `Promptiply: Toggle Economy/Premium` | - | Switch between economy and premium models |
| `Promptiply: Import Profiles` | - | Import profiles from Chrome extension or backup |
| `Promptiply: Export Profiles` | - | Export profiles to JSON |

## 👤 Profiles

Profiles customize how prompts are refined:

### Built-in Profiles

1. **Technical Writer**: Clear, concise documentation-style prompts
2. **Dev Helper**: Code-focused with examples and step-by-step guidance
3. **Marketing Copy**: Persuasive, conversion-focused messaging

### Creating Custom Profiles

1. Run `Promptiply: Create Profile`
2. Enter name, persona, tone, and style guidelines
3. The profile will evolve based on your usage

### Profile Evolution

Profiles automatically track topics you work on frequently:
- **Frequency**: How often you use certain topics
- **Recency**: How recently you've used them
- **Smart Weighting**: 40% frequency + 60% recency

Example: If you frequently refine React prompts, future refinements will be optimized for React context.

## 📊 Usage Examples

### Example 1: Vague to Specific

**Before:**
```
make a function that sorts arrays
```

**After (Dev Helper profile):**
```
Create a TypeScript function that:
• Accepts an array of any type
• Implements a stable sorting algorithm
• Handles edge cases (empty array, single element)
• Returns a new sorted array (immutable)
• Includes unit tests with Jest
• Add JSDoc comments
```

### Example 2: Casual to Professional

**Before:**
```
I need help understanding how JWT works
```

**After (Technical Writer profile):**
```
Provide a comprehensive explanation of JSON Web Tokens (JWT) including:
1. What JWT is and its purpose in authentication
2. The structure of a JWT (header, payload, signature)
3. How JWT signing and verification works
4. Common use cases and security considerations
5. Step-by-step example of JWT implementation
Use clear language with diagrams where helpful.
```

## 🔄 Import from Chrome Extension

If you're using the Promptiply Chrome extension:

1. In Chrome: Export your profiles (Options → Export Profiles)
2. In VSCode: Run `Promptiply: Import Profiles`
3. Select the exported JSON file
4. Your profiles (with evolution data) are now in VSCode!

## 🐛 Troubleshooting

### Copilot Not Available

**Error:** "GitHub Copilot is not available"

**Solution:**
- Ensure you're signed in to GitHub Copilot
- Check that Copilot extension is installed and active
- Try switching to Ollama or API mode

### Ollama Connection Failed

**Error:** "Cannot connect to Ollama"

**Solution:**
- Start Ollama: `ollama serve`
- Verify endpoint in settings (default: `http://localhost:11434`)
- Pull a model: `ollama pull llama3.1:8b`

### Empty or Malformed Response

**Issue:** Refinement returns strange output

**Solution:**
- Try premium mode (better quality)
- Check if the model supports JSON output
- For Ollama: use a larger model (8b instead of 3b)

## 🤝 Contributing

This is an open-source project! Contributions are welcome.

**Repository:** https://github.com/tomronen/promptiply

**Issues:** Report bugs or request features on GitHub

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Built with ❤️ by the Promptiply team.

Chrome extension: [Promptiply for Chrome](https://github.com/tomronen/promptiply)

---

**Tip:** Press `Ctrl+Shift+R` to refine any selected text! 🚀
