# 🚀 Deployment Guide - Smart City Dashboard

## 📋 For GitHub Push

### Files Structure:
- ✅ `index.html` - Main HTML file
- ✅ `script.js` - Main JavaScript
- ✅ `style.css` - Styles
- ✅ `config.example.js` - Template (safe to commit)
- ❌ `config.js` - **DO NOT COMMIT** (contains API keys, already in .gitignore)

### Before Pushing to GitHub:

1. **Verify config.js is ignored:**
   ```bash
   git status
   # config.js should NOT appear in the list
   ```

2. **If config.js shows up, add it manually:**
   ```bash
   git rm --cached config.js
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Smart City Dashboard - Ready for deployment"
   git push origin main
   ```

---

## 🌐 Netlify Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub** (see above)

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect settings (already configured in `netlify.toml`)

3. **Add Environment Variables (API Keys):**
   - In Netlify dashboard → Site settings → Environment variables
   - Add these variables:
     ```
     GOOGLE_MAPS_KEY=your_google_maps_key
     OPENWEATHER_KEY=your_openweather_key
     GEMINI_KEY=your_gemini_key
     ```

4. **Create config.js on Netlify:**
   - Go to Netlify → Deploys → Deploy settings → Build hooks
   - Or use Netlify Functions to inject API keys
   - **Better option:** Use Netlify's environment variables and modify script.js to read from them

### Option 2: Use Environment Variables (Better for Netlify)

Update `script.js` to read from environment variables if available:

```javascript
// In script.js, replace API_CONFIG loading with:
const API_CONFIG = {
    googleMaps: {
        key: window.NETLIFY_ENV?.GOOGLE_MAPS_KEY || (typeof API_CONFIG !== 'undefined' ? API_CONFIG.googleMaps.key : ''),
        // ... rest
    }
};
```

**OR** use Netlify's build-time injection (requires build step).

### Option 3: Manual Deploy

1. **Build locally:**
   - Create `config.js` with your API keys
   - Test locally: `open index.html`

2. **Deploy folder:**
   - Drag and drop the entire folder to Netlify
   - **Note:** This won't work if you need to keep API keys secret

---

## 🔐 Security Best Practices

### For Netlify:

**Recommended:** Use Netlify Environment Variables + Build Script

1. **Create `netlify-build.js`:**
   ```javascript
   // This runs during Netlify build
   const fs = require('fs');
   const config = `const API_CONFIG = {
       googleMaps: { key: process.env.GOOGLE_MAPS_KEY },
       // ... use process.env for all keys
   };`;
   fs.writeFileSync('config.js', config);
   ```

2. **Update `netlify.toml`:**
   ```toml
   [build]
     command = "node netlify-build.js"
     publish = "."
   ```

3. **Add environment variables in Netlify dashboard**

---

## 📝 Quick Setup for New Users

1. **Clone repository:**
   ```bash
   git clone <your-repo-url>
   cd City_Data_Dashboard
   ```

2. **Create config.js:**
   ```bash
   cp config.example.js config.js
   ```

3. **Add your API keys to config.js**

4. **Open index.html in browser**

---

## ✅ Checklist Before GitHub Push

- [ ] `config.js` is in `.gitignore` ✅
- [ ] `config.example.js` exists with placeholders ✅
- [ ] No API keys in any committed files ✅
- [ ] `netlify.toml` exists for deployment ✅
- [ ] README.md has setup instructions ✅
- [ ] All unnecessary files removed ✅

---

**Your codebase is now ready for GitHub and Netlify!** 🎉

