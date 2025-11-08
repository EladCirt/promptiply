# Change Log

All notable changes to the "Promptiply" extension will be documented in this file.

## [0.2.0] - 2025-01-08

### AI Chat Integration (Major Feature!)

- 💬 **Refine from Clipboard** (`Ctrl+Shift+Alt+R`): Perfect for AI chat interfaces!
  - Copy your prompt from Copilot Chat, Cursor, Claude Code, or any AI chat
  - Press the hotkey to refine it
  - Paste the refined version back
  - Works with ANY AI tool!
- ✍️ **Refine from Input Box** (`Ctrl+Alt+R`): Type or paste prompts directly
  - Quick input box for on-the-fly refinement
  - No need to have a file open
  - Great for quick iterations
- 🎯 **Smart Copy Options**: After refinement, choose to:
  - Copy to clipboard immediately
  - Edit before copying
  - View original vs refined comparison
- 📋 **Seamless Workflow**: Copy → Refine → Paste in under 5 seconds

### Improvements

- Enhanced notification messages with clear next steps
- Better user guidance for AI chat workflows
- Updated documentation with AI chat integration examples

## [0.1.0] - 2025-01-08

### Initial Release

- ✨ **Prompt Refinement**: Transform casual prompts into clear, structured requests
- 👤 **Customizable Profiles**: Three built-in profiles (Technical Writer, Dev Helper, Marketing Copy)
- 📊 **Smart Topic Tracking**: Profiles evolve based on usage patterns
- 💰 **Economy/Premium Modes**: Choose between speed/cost and quality
- 🔄 **Multiple Refinement Modes**:
  - VSCode LM API (Copilot) - FREE for Copilot subscribers
  - Ollama (Local) - FREE and private
  - OpenAI API (Coming soon)
  - Anthropic API (Coming soon)
- 🎯 **Flexible UI Options**:
  - Inline replacement
  - Diff view
  - Webview panel (basic)
  - Copy to clipboard
- ⌨️ **Keyboard Shortcuts**:
  - `Ctrl+Shift+R` - Refine selection
  - `Ctrl+Shift+Alt+P` - Switch profile
- 📋 **Import/Export**: Compatible with Chrome extension profile format
- 📊 **Status Bar**: Shows active profile and current mode
- 🎨 **Context Menu**: Right-click to refine selected text

### Known Limitations

- OpenAI and Anthropic API modes not yet implemented
- Webview panel shows basic input box (full panel coming in next version)
- CodeLens provider not yet implemented

### Coming Soon

- 📝 Full-featured webview panel with syntax highlighting
- 🔍 CodeLens "Refine" buttons above prompts
- 📜 Prompt history
- 📝 Prompt templates
- 🌐 OpenAI and Anthropic API support
- 📊 Statistics dashboard
