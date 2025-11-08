# Promptiply Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Step 1: Choose Your Mode

Promptiply works with multiple AI providers. Pick the one that works best for you:

#### Option A: Copilot (Recommended - FREE if you have Copilot)

1. Make sure you're signed in to GitHub Copilot
2. The extension will automatically use your Copilot subscription
3. No API keys needed!

#### Option B: Ollama (FREE & Private)

1. Install Ollama: https://ollama.ai
2. Start Ollama: `ollama serve`
3. Pull a model: `ollama pull llama3.1:8b`
4. Change mode in settings: `"promptiply.mode": "ollama"`

#### Option C: API Keys (Pay-per-use)

Coming soon: OpenAI and Anthropic API support

### Step 2: Select a Profile

Profiles customize how your prompts are refined:

1. Click the Promptiply icon in the status bar (bottom right)
2. Choose a profile:
   - **No Profile**: Basic refinement
   - **Technical Writer**: Clear, documentation-style
   - **Dev Helper**: Code-focused with examples
   - **Marketing Copy**: Persuasive messaging

Or create your own: `Cmd/Ctrl+Shift+P` → "Promptiply: Create Profile"

### Step 3: Refine Your First Prompt

1. Open any file (or create a new one)
2. Type a casual prompt:
   ```
   make a function that sorts numbers
   ```
3. Select the text
4. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
5. Choose how to apply:
   - **Replace Inline**: Immediate replacement
   - **Show Diff**: Side-by-side comparison
   - **Copy**: Just copy to clipboard

### Step 4: See the Magic ✨

Your prompt is now refined! Example transformation:

**Before:**
```
make a function that sorts numbers
```

**After (Dev Helper profile):**
```
Create a TypeScript function that:
• Accepts an array of numbers as input
• Implements an efficient sorting algorithm (e.g., quicksort or built-in sort)
• Handles edge cases (empty array, single element, already sorted)
• Returns a new sorted array in ascending order
• Includes JSDoc comments explaining parameters and return value
• Add unit tests covering edge cases
```

## 🎯 Pro Tips

### Economy vs Premium Mode

Toggle with `Promptiply: Toggle Economy/Premium Mode`

- **Economy**: Faster, cheaper (gpt-3.5-turbo, llama3.2:3b)
- **Premium**: Better quality, slower (gpt-4o, llama3.1:8b)

Both are FREE if using Copilot or Ollama!

### Let Profiles Evolve

As you use the extension, profiles learn your favorite topics:

1. Refine prompts about React → Profile remembers you work with React
2. Next time: Refinements automatically optimize for React context
3. View profile stats: `Promptiply: View Profile`

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Refine selection | `Ctrl/Cmd+Shift+R` |
| Switch profile | `Ctrl/Cmd+Shift+Alt+P` |

### Import from Chrome Extension

Have profiles in the Chrome extension?

1. Chrome: Options → Export Profiles
2. VSCode: `Promptiply: Import Profiles`
3. Select the JSON file
4. Done! Your profiles (with evolution data) are now in VSCode

## 🆘 Troubleshooting

### "Copilot not available"

- Ensure GitHub Copilot extension is installed
- Sign in to GitHub Copilot
- Restart VSCode

### "Cannot connect to Ollama"

- Start Ollama: `ollama serve`
- Verify endpoint: Settings → `promptiply.ollama.endpoint`
- Pull a model: `ollama pull llama3.1:8b`

### Strange Output

- Try Premium mode (better quality)
- For Ollama: use a larger model (8b instead of 3b)
- Check that the model supports JSON output

## 🎓 Next Steps

- **Create custom profiles** for your specific needs
- **Try different UI modes** (inline, diff, webview)
- **Share profiles** with your team (export → share JSON)
- **Track your usage** in profile stats

## 🤝 Need Help?

- GitHub Issues: https://github.com/tomronen/promptiply/issues
- Documentation: See README.md
- Chrome Extension: https://github.com/tomronen/promptiply

Happy prompting! 🚀
