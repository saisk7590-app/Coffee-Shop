# Mobile Setup Guide - Coffee Shop App

This guide will help you run your coffee shop app on your physical mobile device using Expo Go.

## 🚀 Quick Start (Recommended for Office Network)

Since you're on an office network without WiFi access, use **ngrok** to create a tunnel.

### Step 1: Install ngrok

1. Download ngrok from: https://ngrok.com/download
2. Extract and place `ngrok.exe` somewhere accessible (e.g., `C:\ngrok\`)
3. (Optional) Add to PATH or use full path when running

### Step 2: Start Your Backend

Open Terminal 1:
```bash
cd f:\coffee-shop-app\backend
npm start
```

You should see:
```
✅ Backend running on port 3000
🌐 Server accessible at: http://localhost:3000
📱 For mobile: Use ngrok or update with your tunnel URL
```

### Step 3: Create ngrok Tunnel

Open Terminal 2:
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc123-ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123-ngrok-free.app`)

### Step 4: Configure Frontend with Tunnel URL

Create a file `f:\coffee-shop-app\frontend\.env`:

```env
EXPO_PUBLIC_API_URL=https://abc123-ngrok-free.app
```

Replace `abc123-ngrok-free.app` with YOUR actual ngrok URL from Step 3.

### Step 5: Test Backend via Tunnel

Open your browser and visit:
```
https://abc123-ngrok-free.app/menu
```

You should see JSON menu data. If you see an ngrok warning page, click "Visit Site".

### Step 6: Start Expo with Tunnel

Open Terminal 3:
```bash
cd f:\coffee-shop-app\frontend
npx expo start --tunnel
```

Wait 30-60 seconds for the tunnel to connect. You'll see a QR code.

### Step 7: Open on Your Mobile Device

1. Install **Expo Go** app from Play Store/App Store
2. Open Expo Go
3. Scan the QR code from Terminal 3
4. App should load on your phone!

### Step 8: Test the App

- Try logging in (use demo credentials from login screen)
- Navigate to menu
- Place an order
- Check if orders appear in chef view

---

## 🌐 Alternative: Cloud Deployment (Best for Permanent Demo)

If ngrok is blocked or you want a permanent solution:

### Option A: Deploy to Render (Free)

1. Go to https://render.com
2. Create a new Web Service
3. Connect your GitHub repo (or upload code)
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables (DB credentials)
7. Deploy and copy the URL (e.g., `https://your-app.onrender.com`)
8. Update `frontend/.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://your-app.onrender.com
   ```

### Option B: Deploy to Railway (Free)

1. Go to https://railway.app
2. Create new project from GitHub
3. Add PostgreSQL database
4. Deploy backend
5. Copy the public URL
6. Update `frontend/.env` with the URL

---

## 📱 Testing on Local Network (If WiFi Available)

If you get WiFi access later:

### Step 1: Find Your PC's IP Address

Open Command Prompt:
```bash
ipconfig
```

Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

### Step 2: Update Frontend Config

Edit `f:\coffee-shop-app\frontend\.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Replace `192.168.1.100` with YOUR actual IP.

### Step 3: Start Expo (Without Tunnel)

```bash
cd f:\coffee-shop-app\frontend
npx expo start
```

Scan QR code with Expo Go.

---

## 🔧 Troubleshooting

### "Network request failed" on mobile
- Check that ngrok tunnel is still running
- Verify the URL in `.env` matches your ngrok URL
- ngrok free URLs expire after 2 hours - restart ngrok and update `.env`

### "Cannot connect to Metro bundler"
- Use `npx expo start --tunnel` instead of `npx expo start`
- Wait longer for tunnel to establish (can take 60+ seconds)
- Check your internet connection

### Backend not accessible via ngrok URL
- Ensure backend is running on port 3000
- Check that `server.js` is listening on `0.0.0.0`
- Try restarting ngrok

### App loads but API calls fail
- Check browser console / Expo logs for exact error
- Verify `.env` file exists in `frontend/` directory
- Restart Expo after changing `.env` file

### ngrok shows "Visit Site" warning
- This is normal for free ngrok accounts
- Click "Visit Site" to proceed
- The app will work after clicking through once

---

## 📝 Important Notes

- **ngrok free URLs change** every time you restart ngrok - update `.env` each time
- **Restart Expo** after changing `.env` file for changes to take effect
- **Keep all 3 terminals running**: Backend, ngrok, Expo
- For **production deployment**, use a cloud service instead of ngrok
