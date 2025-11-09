# VSCode Extension Repository Migration Plan

## 🎯 Goal
Move the VSCode extension to a separate repository with proper structure, documentation, tests, CI/CD, and release automation.

---

## 📦 Phase 1: New Repository Setup

### 1.1 Create New Repository

**Repository Name:** `promptiply-vscode`

**GitHub Setup:**
```bash
# On GitHub, create new repo: promptiply-vscode
# Description: "VSCode extension for Promptiply - Refine prompts with AI-powered profiles"
# Initialize with: Nothing (we'll push existing code)
```

### 1.2 Repository Structure

```
promptiply-vscode/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Test on every push/PR
│   │   ├── release.yml               # Auto-publish to marketplace
│   │   └── codeql.yml                # Security scanning
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── config.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml                # Auto dependency updates
├── docs/
│   ├── installation.md               # Install guide
│   ├── getting-started.md            # Quick start
│   ├── features.md                   # Feature documentation
│   ├── sync-integration.md           # Sync with Chrome extension
│   ├── contributing.md               # How to contribute
│   ├── development.md                # Dev setup
│   └── api.md                        # API/architecture docs
├── src/
│   ├── chat/                         # Chat participant
│   ├── commands/                     # Command implementations
│   ├── history/                      # History management
│   ├── profiles/                     # Profile system
│   ├── refinement/                   # Refinement engine
│   ├── templates/                    # Template system
│   ├── ui/                           # UI components
│   └── extension.ts                  # Main entry point
├── test/
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── fixtures/                     # Test fixtures
├── test-data/                        # Test data files
│   ├── valid-vscode-sync.json
│   ├── chrome-export-format.json
│   └── invalid-missing-list.json
├── media/                            # Images, icons, demos
│   ├── icon.png
│   ├── screenshots/
│   │   ├── chat-refinement.gif
│   │   ├── profile-recommendation.gif
│   │   └── sync-demo.gif
│   └── logo/
├── .vscode/                          # VSCode workspace settings
│   ├── extensions.json               # Recommended extensions
│   ├── launch.json                   # Debug configs
│   ├── settings.json                 # Workspace settings
│   └── tasks.json                    # Build tasks
├── .vscodeignore                     # Files to exclude from .vsix
├── .gitignore
├── .eslintrc.json                    # Linting rules
├── .prettierrc                       # Code formatting
├── package.json                      # Extension manifest
├── package-lock.json
├── tsconfig.json                     # TypeScript config
├── webpack.config.js                 # Build config
├── README.md                         # Main documentation
├── CHANGELOG.md                      # Version history
├── LICENSE                           # MIT License
├── CODE_OF_CONDUCT.md                # Code of conduct
├── CONTRIBUTING.md                   # Contribution guidelines
├── SECURITY.md                       # Security policy
└── test-sync.js                      # Automated tests
```

---

## 📋 Phase 2: File Migration from Current Repo

### 2.1 Files to Move (Keep History)

**Option A: Git Subtree Split (Preserves history)**
```bash
# Create new repo with only vscode-extension history
git subtree split -P vscode-extension -b vscode-only
git push <new-repo-url> vscode-only:main
```

**Option B: Fresh Start (Clean history)**
```bash
# Just copy files to new repo
# Simpler, cleaner git history
```

**Recommendation:** Use Option B (fresh start) for cleaner history

### 2.2 Files to Copy

From `/home/user/promptiply/vscode-extension/`:
- ✅ `src/` - All source code
- ✅ `package.json` - Extension manifest
- ✅ `package-lock.json` - Dependencies
- ✅ `tsconfig.json` - TypeScript config
- ✅ `webpack.config.js` - Build config
- ✅ `CHANGELOG.md` - Version history
- ✅ `.vscodeignore` - Package exclusions

From `/home/user/promptiply/`:
- ✅ `SYNC_INTEGRATION.md` → `docs/sync-integration.md`
- ✅ `MANUAL_TESTING_GUIDE.md` → `docs/testing.md`
- ✅ `test-data/` - Test data files
- ✅ `test-sync.js` - Automated tests

### 2.3 Files to Create (New)

**Documentation:**
- `README.md` - Comprehensive main README
- `docs/installation.md`
- `docs/getting-started.md`
- `docs/features.md`
- `docs/development.md`
- `docs/api.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`

**GitHub:**
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.github/workflows/codeql.yml`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/dependabot.yml`

**Config:**
- `.eslintrc.json`
- `.prettierrc`
- `.editorconfig`
- `LICENSE` (MIT)

**Media:**
- `media/icon.png`
- Screenshots/GIFs for README

---

## 🔧 Phase 3: GitHub Actions Workflows

### 3.1 CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Push to main, Pull requests
**Jobs:**
1. **Lint** - Run ESLint
2. **Type Check** - Run TypeScript compiler
3. **Test** - Run automated tests
4. **Build** - Compile extension
5. **Package** - Create .vsix file

**Example:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run compile
      - run: npm test
      - run: npm run package
```

### 3.2 Release Workflow (`.github/workflows/release.yml`)

**Triggers:** Tag push (v*)
**Jobs:**
1. **Build** - Compile and package .vsix
2. **Test** - Run full test suite
3. **Publish** - Publish to VSCode Marketplace
4. **GitHub Release** - Create GitHub release with .vsix

**Features:**
- Auto version bump
- Auto changelog generation
- Marketplace publishing with PAT
- GitHub release with .vsix attachment

**Example:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npx vsce package
      - name: Publish to Marketplace
        run: npx vsce publish -p ${{ secrets.VSCE_PAT }}
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### 3.3 CodeQL Security Scanning

**Triggers:** Push, Pull request, Schedule
**Purpose:** Detect security vulnerabilities

---

## 🧪 Phase 4: Testing Infrastructure

### 4.1 Test Structure

```
test/
├── unit/
│   ├── profiles.test.ts          # Profile manager tests
│   ├── sync.test.ts              # Sync validation tests
│   ├── recommender.test.ts       # Recommendation tests
│   └── learning.test.ts          # Learning system tests
├── integration/
│   ├── chat.test.ts              # Chat participant tests
│   ├── commands.test.ts          # Command tests
│   └── sync-flow.test.ts         # Full sync flow tests
└── fixtures/
    ├── profiles.json
    └── sync-data.json
```

### 4.2 Test Framework

**Use:** Mocha + Chai (already in dependencies)

**Add to package.json:**
```json
{
  "scripts": {
    "test": "mocha -r ts-node/register test/**/*.test.ts",
    "test:unit": "mocha -r ts-node/register test/unit/**/*.test.ts",
    "test:integration": "mocha -r ts-node/register test/integration/**/*.test.ts",
    "test:watch": "mocha -r ts-node/register test/**/*.test.ts --watch"
  }
}
```

### 4.3 Coverage Reports

**Add:** nyc (Istanbul) for coverage
```bash
npm install --save-dev nyc
```

**Add to package.json:**
```json
{
  "scripts": {
    "test:coverage": "nyc npm test"
  },
  "nyc": {
    "extension": [".ts"],
    "exclude": ["**/*.test.ts"],
    "reporter": ["html", "text"],
    "all": true
  }
}
```

---

## 📚 Phase 5: Documentation

### 5.1 Main README.md Structure

```markdown
# Promptiply for VSCode

> AI-powered prompt refinement with intelligent profiles and cross-platform sync

[Badges: Version, Downloads, Rating, Build Status, License]

## ✨ Features
- Smart profile recommendations
- Learning from your choices
- Sync with Chrome extension
- 9 professional profiles included
- In-chat refinement (@promptiply)

## 🚀 Quick Start
[Installation steps]
[Basic usage]

## 📖 Documentation
- [Getting Started](docs/getting-started.md)
- [Features](docs/features.md)
- [Sync Integration](docs/sync-integration.md)
- [Contributing](CONTRIBUTING.md)

## 🎬 Demos
[GIFs showing features]

## 🔧 Development
[How to build and test]

## 📝 License
MIT - See LICENSE
```

### 5.2 docs/ Contents

**installation.md:**
- Install from marketplace
- Install from .vsix
- Build from source

**getting-started.md:**
- First-time setup
- Creating profiles
- Using recommendations
- Chat refinement

**features.md:**
- Detailed feature documentation
- Configuration options
- Commands reference

**sync-integration.md:**
- (Move SYNC_INTEGRATION.md here)
- Cross-platform sync guide

**development.md:**
- Setup dev environment
- Build process
- Testing
- Debugging
- Architecture overview

**contributing.md:**
- Code style
- Pull request process
- Reporting bugs
- Feature requests

---

## 🧹 Phase 6: Cleanup & Improvements

### 6.1 Code Cleanup

**Remove:**
- Unused dependencies
- Dead code
- Console.log statements (replace with proper logging)
- TODO comments (convert to issues)

**Improve:**
- Add JSDoc comments
- Consistent error handling
- Better type definitions
- Extract magic numbers to constants

### 6.2 Dependencies Audit

```bash
# Check for outdated packages
npm outdated

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update
```

**Remove unused dependencies:**
- Check package.json
- Remove any dev dependencies not being used

### 6.3 Add Missing Dependencies

**Recommended additions:**
```json
{
  "devDependencies": {
    "@types/mocha": "^10.0.6",
    "@types/chai": "^4.3.11",
    "chai": "^4.3.10",
    "nyc": "^15.1.0",
    "prettier": "^3.1.1",
    "eslint-config-prettier": "^9.1.0"
  }
}
```

### 6.4 .vscodeignore Optimization

**Exclude from package:**
```
.vscode/**
.github/**
src/**
test/**
test-data/**
docs/**
*.md
!README.md
!CHANGELOG.md
.gitignore
.eslintrc.json
.prettierrc
tsconfig.json
webpack.config.js
test-sync.js
**/*.map
**/*.ts
!out/**/*.d.ts
node_modules/**
```

This keeps the .vsix small!

---

## 🎨 Phase 7: Visual Assets

### 7.1 Screenshots/GIFs to Create

**Priority demos:**
1. **Chat refinement** - @promptiply in action
2. **Profile recommendations** - Smart suggestions with medals
3. **Sync demo** - Chrome ↔ VSCode sync
4. **Learning system** - Showing confidence improving
5. **Built-in profiles** - 9 professional profiles

**Tools:**
- LICEcap (GIF recording)
- ShareX (screenshots)
- Gifski (GIF optimization)

### 7.2 README Badges

```markdown
[![Version](https://img.shields.io/visual-studio-marketplace/v/promptiply.promptiply)](https://marketplace.visualstudio.com/items?itemName=promptiply.promptiply)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/promptiply.promptiply)](https://marketplace.visualstudio.com/items?itemName=promptiply.promptiply)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/promptiply.promptiply)](https://marketplace.visualstudio.com/items?itemName=promptiply.promptiply)
[![Build](https://github.com/EladCirt/promptiply-vscode/workflows/CI/badge.svg)](https://github.com/EladCirt/promptiply-vscode/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
```

---

## 🔐 Phase 8: Security & Best Practices

### 8.1 Security Policy (SECURITY.md)

```markdown
# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities to: [email]

Do not open public issues for security vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.5.x   | ✅                |
| < 0.5   | ❌                |
```

### 8.2 Code of Conduct

Use standard Contributor Covenant

### 8.3 Dependabot Config

**`.github/dependabot.yml`:**
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

---

## 📦 Phase 9: Marketplace Publishing Setup

### 9.1 Publisher Setup

1. **Create Azure DevOps Account** (required for PAT)
2. **Create Personal Access Token (PAT)**
   - Scope: Marketplace (Acquire, Manage)
3. **Register Publisher**
   ```bash
   npx vsce create-publisher promptiply
   ```

### 9.2 package.json Marketplace Fields

```json
{
  "publisher": "promptiply",
  "displayName": "Promptiply",
  "description": "AI-powered prompt refinement with intelligent profiles",
  "icon": "media/icon.png",
  "galleryBanner": {
    "color": "#1e1e1e",
    "theme": "dark"
  },
  "keywords": [
    "ai",
    "prompt",
    "chatgpt",
    "claude",
    "refinement",
    "profiles"
  ],
  "categories": [
    "Other",
    "Machine Learning"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/EladCirt/promptiply-vscode"
  },
  "bugs": {
    "url": "https://github.com/EladCirt/promptiply-vscode/issues"
  },
  "homepage": "https://github.com/EladCirt/promptiply-vscode#readme"
}
```

### 9.3 GitHub Secrets Setup

**Add to new repo:**
- `VSCE_PAT` - Personal Access Token for marketplace publishing

---

## 🗑️ Phase 10: Cleanup Original Repo

### 10.1 Remove VSCode Extension

```bash
# In promptiply repo
git rm -r vscode-extension/
git commit -m "refactor: Move VSCode extension to separate repository

VSCode extension has been moved to: https://github.com/EladCirt/promptiply-vscode

This repo now focuses solely on the Chrome browser extension."
```

### 10.2 Update Main README

```markdown
# promptiply (Chrome Extension)

> Refine prompts inline on ChatGPT and Claude using profiles

## 📦 Other Versions

- **VSCode Extension:** [promptiply-vscode](https://github.com/EladCirt/promptiply-vscode)

[Rest of Chrome extension README]
```

### 10.3 Remove VSCode-Specific Files

```bash
# Remove files only relevant to VSCode
git rm SYNC_INTEGRATION.md
git rm MANUAL_TESTING_GUIDE.md
git rm test-sync.js
git rm -r test-data/
```

### 10.4 Add Cross-Reference

Create `.github/README.md`:
```markdown
# Promptiply Extensions

This repository contains the **Chrome browser extension**.

For the **VSCode extension**, see: [promptiply-vscode](https://github.com/EladCirt/promptiply-vscode)
```

---

## 📅 Phase 11: Migration Execution Plan

### Step-by-Step Execution:

#### **Day 1: Setup**
- [ ] Create new GitHub repo `promptiply-vscode`
- [ ] Set up local directory
- [ ] Initialize git
- [ ] Copy files from old repo
- [ ] Initial commit

#### **Day 2: Structure**
- [ ] Create folder structure
- [ ] Move files to proper locations
- [ ] Create package.json with proper fields
- [ ] Add .gitignore, .vscodeignore
- [ ] Test build locally

#### **Day 3: Documentation**
- [ ] Write main README.md
- [ ] Create docs/ files
- [ ] Add CONTRIBUTING.md
- [ ] Add CODE_OF_CONDUCT.md
- [ ] Add SECURITY.md

#### **Day 4: GitHub Setup**
- [ ] Create issue templates
- [ ] Create PR template
- [ ] Add dependabot config
- [ ] Create GitHub Actions workflows
- [ ] Test CI pipeline

#### **Day 5: Testing**
- [ ] Set up test framework
- [ ] Write unit tests
- [ ] Add coverage reporting
- [ ] Test CI runs tests

#### **Day 6: Assets**
- [ ] Create/optimize icon
- [ ] Record demo GIFs
- [ ] Add screenshots
- [ ] Update README with visuals

#### **Day 7: Publishing**
- [ ] Create Azure DevOps PAT
- [ ] Register publisher
- [ ] Test vsce package
- [ ] Add GitHub secrets
- [ ] Test release workflow (dry run)

#### **Day 8: Cleanup**
- [ ] Clean old repo
- [ ] Update old README
- [ ] Cross-link repos
- [ ] Archive old vscode-extension branch

#### **Day 9: Release**
- [ ] Create v0.5.0 tag
- [ ] Trigger release workflow
- [ ] Verify marketplace listing
- [ ] Announce on GitHub

---

## 🎯 Success Criteria

✅ **Repository:**
- Clean, organized structure
- All files in proper locations
- Comprehensive documentation

✅ **CI/CD:**
- Tests run on every PR
- Auto-publish to marketplace on tag
- Security scanning enabled

✅ **Documentation:**
- Clear README with demos
- Complete docs/ folder
- Contribution guidelines

✅ **Testing:**
- Unit tests with >80% coverage
- Integration tests
- Automated test suite

✅ **Marketplace:**
- Published to VSCode marketplace
- Good description and screenshots
- Proper keywords and categories

✅ **Cleanup:**
- Old repo cleaned
- Cross-references in place
- No duplicate files

---

## 🚀 Quick Start Commands

### Create New Repo
```bash
# 1. Create on GitHub: promptiply-vscode

# 2. Clone and setup locally
mkdir promptiply-vscode
cd promptiply-vscode
git init
git remote add origin https://github.com/EladCirt/promptiply-vscode.git

# 3. Copy files from old repo
cp -r ../promptiply/vscode-extension/* .
cp ../promptiply/SYNC_INTEGRATION.md ./docs/sync-integration.md
cp ../promptiply/MANUAL_TESTING_GUIDE.md ./docs/testing.md
cp -r ../promptiply/test-data ./
cp ../promptiply/test-sync.js ./

# 4. Install dependencies
npm install

# 5. Test build
npm run compile

# 6. Initial commit
git add .
git commit -m "feat: Initial VSCode extension repository

Migrated from promptiply monorepo with complete structure:
- Full source code
- Documentation
- Tests
- CI/CD workflows
- Marketplace configuration"

# 7. Push to GitHub
git push -u origin main
```

---

## 📌 Important Notes

### Versioning Strategy
- **Start at v0.5.0** (matching current version)
- Use semantic versioning (semver)
- Update CHANGELOG.md for every release

### License
- Use MIT License
- Match original repo license
- Include copyright notice

### Naming Convention
- Repo: `promptiply-vscode`
- Package: `promptiply`
- Publisher: `promptiply`
- Display Name: "Promptiply"

### Links to Update
- Package.json repository field
- README badges
- Marketplace listing
- Issue tracker
- Homepage

---

## ❓ Questions to Answer Before Starting

1. **Repository name:** `promptiply-vscode` or different?
2. **Publisher name:** `promptiply` or your username?
3. **License:** Keep MIT or change?
4. **Marketplace category:** "Other" + "Machine Learning" or different?
5. **Preserve git history:** Yes (subtree split) or No (fresh start)?

**My Recommendation:**
- Name: `promptiply-vscode` ✅
- Publisher: `promptiply` ✅
- License: MIT ✅
- Categories: "Other" + "Machine Learning" ✅
- History: Fresh start (cleaner) ✅

---

## 📞 Next Steps

Ready to start? Let me know and I can:

1. ✅ Create all the GitHub workflow files
2. ✅ Write the comprehensive README
3. ✅ Set up the test structure
4. ✅ Create issue/PR templates
5. ✅ Generate the documentation files
6. ✅ Help with the migration execution

Just say "let's start" and I'll begin! 🚀
