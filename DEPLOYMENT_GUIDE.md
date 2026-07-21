# BECA Assessment App - Deployment Guide

Complete guide to deploy the assessment app with Netlify + GitHub + Supabase.

---

## 📋 Prerequisites

✅ GitHub account  
✅ Netlify account (free tier works)  
✅ Supabase project with database set up  
✅ Project code on GitHub

---

## Step 1: Copy App Files to Project

Copy these files to your project folder:
```
BECA-Assessment/
├── index.html
├── app.js
├── style.css
├── supabase-client.js
├── netlify.toml
├── .env.example
└── (keep backend/ for reference)
```

---

## Step 2: Get Supabase Credentials

### Find Your Credentials:

1. Go to: https://app.supabase.com
2. Click your project
3. Go to: **Settings → API**
4. Copy:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **Anon Key** (starts with: `eyJ...`)

**Keep these safe!**

---

## Step 3: Push Code to GitHub

```bash
# Navigate to project
cd "C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment"

# Add all files
git add .

# Commit
git commit -m "Add BECA Assessment App - HTML/JS frontend with Supabase"

# Push to GitHub
git push origin main
```

**Verify on GitHub:**
- Go to https://github.com/YOUR_USERNAME/BECA-Assessment
- You should see: index.html, app.js, style.css, netlify.toml

---

## Step 4: Deploy to Netlify

### Method A: Deploy from GitHub (Recommended)

1. Go to: https://app.netlify.com
2. Click **"Add new site"**
3. Select **"Import an existing project"**
4. Choose **GitHub** → Authorize Netlify
5. Select your repo: **BECA-Assessment**

**Build Settings:**
```
Build command: (leave empty)
Publish directory: . (current directory - it's static files)
```

6. Click **"Deploy site"**

**⏳ Wait 1-3 minutes for build...**

You'll see:
```
✓ Build Successful
✓ Site is live at: https://beca-assessment-xyz.netlify.app
```

---

## Step 5: Set Environment Variables

After deployment:

1. Go to your **Netlify site**
2. Click **"Site settings"**
3. Go to: **Build & deploy → Environment**
4. Click **"Edit variables"**
5. Add these environment variables:

```
Key: VITE_SUPABASE_URL
Value: https://your-project.supabase.co

Key: VITE_SUPABASE_ANON_KEY
Value: your-anon-key-here
```

6. Click **"Save"**

---

## Step 6: Trigger Redeploy

Since you just added env vars, redeploy:

1. Go to **Netlify → Deploys**
2. Click **"Trigger deploy"** → **"Deploy site"**

**⏳ Wait for build to complete...**

---

## Step 7: Test Your App

1. Go to your Netlify URL: `https://your-site.netlify.app`
2. You should see: **BECA Assessment** login page
3. Try to login with a test account

**If you see blank page:**
- Check browser console (F12 → Console)
- Look for errors
- Verify env variables are set correctly

**If login fails:**
- Check Supabase credentials
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure they're set in Netlify environment

---

## Step 8: Auto-Deploy on GitHub Push

Great news! It's already set up. Now:

```
1. Make changes to code
2. git add .
3. git commit -m "Update: feature"
4. git push origin main

↓

Netlify automatically:
✓ Detects the push
✓ Rebuilds your site
✓ Deploys new version
✓ Site updates in 30-60 seconds
```

---

## Troubleshooting

### Problem: Blank Page

**Solution:**
```bash
# Check browser console (F12)
# Look for: "Cannot read property supabase of undefined"

# This means supabase-client.js didn't load
# Make sure the file path is correct in index.html
```

### Problem: "Failed to authenticate"

**Solution:**
1. Check Netlify env variables are set
2. Verify Supabase URL is correct (https://...)
3. Verify Anon Key is correct
4. Try clearing browser cache (Ctrl+Shift+Del)

### Problem: Site not updating after push

**Solution:**
```bash
# Check GitHub: push actually worked
git log --oneline -3

# Check Netlify: go to Deploys tab
# Look for recent builds

# If no new deploy: Click "Trigger deploy" manually
```

### Problem: "Not Found" after refresh

**Solution:**
This is because it's a single-page app. Netlify should handle this.

Check: **Netlify → Site settings → Redirects**

Should show:
```
Rule: /* → /index.html  Status: 200
```

If not there, the netlify.toml didn't load. Redeploy.

---

## Monitoring & Logs

### View Build Logs:
1. Netlify → **Deploys**
2. Click on any deploy
3. Click **"Deploy log"**
4. See detailed build steps

### View Site Logs:
1. Netlify → **Functions** (if using)
2. Click **"Logs"**
3. See real-time activity

---

## Performance Optimization

### Cache Settings:
Already configured in `netlify.toml`:
- Static files cached for 1 hour
- HTML cached for 0 seconds (always fresh)

### Compression:
Netlify automatically:
- Minifies CSS/JS
- Compresses images
- Gzips responses

---

## Security Checklist

✅ Supabase Anon Key is used (not service key)  
✅ RLS policies protect data  
✅ HTTPS enabled (automatic on Netlify)  
✅ Environment variables not in code  
✅ GitHub repo is public (only anon key exposed)

---

## Domain Setup (Optional)

To use your own domain:

1. Netlify → **Site settings → Domain management**
2. Click **"Add custom domain"**
3. Enter your domain: `assessment.yourdomain.com`
4. Follow DNS setup instructions
5. Done! ✅

---

## Continuous Deployment Workflow

```
1. Make code changes
2. Test locally (optional)
3. git add . && git commit -m "..."
4. git push origin main
5. Netlify auto-builds and deploys
6. Check your site at https://your-site.netlify.app
```

---

## FAQ

**Q: Can I use a different hosting?**
A: Yes! Any static host works (Vercel, GitHub Pages, etc). Just upload these files.

**Q: How often does it auto-deploy?**
A: Instantly on every push to main branch.

**Q: Can I have multiple environments?**
A: Yes! Create a `development` branch for staging, `main` for production.

**Q: Do I need a backend server?**
A: No! Supabase handles all data (it's serverless).

---

## Next Steps

1. ✅ Test the app works
2. ✅ Create test accounts in Supabase
3. ✅ Create test assessments in database
4. ✅ Share URL with users
5. ✅ Monitor usage in Supabase

---

## Support

- **Netlify Docs:** https://docs.netlify.com
- **Supabase Docs:** https://supabase.io/docs
- **GitHub:** Your repo at https://github.com/ARajaman180/BECA-Assessment

---

**Your app is now live and auto-deploying!** 🚀
