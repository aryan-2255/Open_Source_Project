# 🚀 Quick Setup Guide

## Before Pushing to GitHub

### ✅ Security Checklist

1. **Verify `config.js` is protected**
   - ✅ `config.js` is already in `.gitignore`
   - ✅ `config.example.js` is safe to commit (no real keys)
   - ✅ Your API keys in `config.js` will NOT be committed

2. **Files Safe to Commit:**
   - ✅ `index.html`
   - ✅ `style.css`
   - ✅ `script.js`
   - ✅ `config.example.js` (template with placeholders)
   - ✅ `build-config.js`
   - ✅ `.gitignore`
   - ✅ `README.md`
   - ✅ `DEPLOYMENT.md`
   - ✅ `SETUP.md` (this file)

3. **Files NOT Committed (Protected):**
   - ❌ `config.js` (contains your real API keys)
   - ❌ `.env` files
   - ❌ Any `*.key` files

### 📋 Pre-Push Checklist

```bash
# 1. Verify config.js is ignored
git check-ignore config.js

# 2. Check what will be committed (should NOT include config.js)
git status

# 3. Add files (config.js will be automatically ignored)
git add .

# 4. Verify config.js is NOT in staging
git status

# 5. Commit (safe to push)
git commit -m "Initial commit - Smart City Dashboard"
```

## 🎯 Quick Start for Contributors

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Project_Source
   ```

2. **Create your config file**
   ```bash
   cp config.example.js config.js
   ```

3. **Add your API keys to `config.js`**
   - Open `config.js`
   - Replace `YOUR_API_KEY_HERE` placeholders with your actual keys
   - Save the file

4. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server: `python -m http.server 8000`

## 🔑 Getting API Keys

See [README.md](./README.md#-getting-api-keys) for detailed instructions.

### Quick Links:
- [Google Cloud Console](https://console.cloud.google.com/) - Maps & Air Quality APIs
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Gemini API
- [OpenWeatherMap](https://openweathermap.org/api) - Weather API

## ⚠️ Important Notes

- **Never commit `config.js`** - It contains your real API keys
- **Always use `config.example.js`** as a template for contributors
- **Restrict API keys** in Google Cloud Console for security
- **Use environment variables** for production deployment (see DEPLOYMENT.md)

---

**Your API keys are safe! ✅**

