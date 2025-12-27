# ✅ DEPLOYMENT CHECKLIST

## 📋 Tiền Deployment (Local Testing)

- [ ] **Code đã commit hết:**
  ```bash
  git status  # Không có uncommitted changes
  git log --oneline  # Xem các commit
  ```

- [ ] **Build local thành công:**
  ```bash
  npm run build:production
  npm run preview
  ```
  ✅ Không có error, preview hoạt động

- [ ] **API hoạt động local:**
  ```bash
  npm run server:dev  # Terminal 1
  npm run dev         # Terminal 2
  ```
  ✅ http://localhost:3000 kết nối được backend

- [ ] **Database seed dữ liệu:**
  ```bash
  npm run seed
  ```
  ✅ Dữ liệu test tạo thành công

- [ ] **Test đăng nhập:**
  - [ ] Sinh viên đăng nhập OK
  - [ ] Admin đăng nhập OK
  - [ ] Đăng ký mới OK

---

## 🌐 MongoDB Atlas Setup

- [ ] **Account tạo:** https://www.mongodb.com/cloud/atlas
- [ ] **Organization → Project → Cluster**
- [ ] **Database User:**
  ```
  Username: sv5t_user
  Password: (saved securely)
  ```
- [ ] **Network Access:** Allow 0.0.0.0/0
- [ ] **Connection String:** `mongodb+srv://sv5t_user:PASSWORD@cluster.mongodb.net/sv5t_database?retryWrites=true&w=majority`
- [ ] **Test connection:** Local code kết nối được

---

## 🚀 Frontend - Vercel Deployment

### Setup
- [ ] **GitHub repository tạo**
- [ ] **Code push lên GitHub:**
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/sv5t.git
  git push -u origin main
  ```

### Vercel Configuration
- [ ] **Account tạo:** https://vercel.com
- [ ] **New Project → Import GitHub repo**
- [ ] **Framework Preset:** Vite
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`
- [ ] **Install Command:** `npm install`
- [ ] **Root Directory:** `./`

### Environment Variables (Vercel)
- [ ] `VITE_API_URL` = (pending backend URL)
- [ ] `REACT_APP_API_URL` = (pending backend URL)

### Deploy
- [ ] **Click "Deploy"**
- [ ] **Wait for build (~2-5 min)**
- [ ] **Get Vercel URL:** https://sv5t.vercel.app (or custom domain)
- [ ] **Test:** Open URL, landing page loads

---

## 🔧 Backend - Render Deployment

### Setup
- [ ] **Render Account tạo:** https://render.com
- [ ] **Login bằng GitHub**

### Create Service
- [ ] **New → Web Service**
- [ ] **Select GitHub repository**
- [ ] **Configure:**
  ```
  Name: sv5t-backend
  Runtime: Node
  Build Command: npm install
  Start Command: node server/server.js
  Plan: Free (hoặc Starter)
  Region: Singapore (nếu khách ở VN) hoặc US
  ```

### Environment Variables (Render)
- [ ] `MONGODB_URI` = MongoDB Atlas connection string
- [ ] `NODE_ENV` = production
- [ ] `PORT` = 10000 (auto, không cần set)
- [ ] `JWT_SECRET` = (secure random string)
- [ ] `ADMIN_SECRET` = (secure random string)

### Deploy
- [ ] **Click "Create Web Service"**
- [ ] **Wait for build (~5-10 min)**
- [ ] **Get Render URL:** https://sv5t-backend.onrender.com

---

## 🔗 Connect Frontend ↔ Backend

- [ ] **Render backend có hoạt động:**
  ```bash
  curl https://sv5t-backend.onrender.com/health
  # Response: {"status":"OK",...}
  ```

- [ ] **Update Vercel Environment Variables:**
  ```
  VITE_API_URL = https://sv5t-backend.onrender.com/api
  REACT_APP_API_URL = https://sv5t-backend.onrender.com/api
  ```

- [ ] **Vercel tự động redeploy** (hoặc manual redeploy)

- [ ] **Update backend CORS (nếu cần):**
  ```javascript
  // server/server.js
  app.use(cors({
    origin: ['https://sv5t.vercel.app', 'http://localhost:3000'],
    credentials: true
  }));
  ```

- [ ] **Redeploy backend:**
  ```bash
  git push  # Trigger Render redeploy
  ```

---

## 🧪 Production Testing

- [ ] **Frontend loads:**
  ```
  https://sv5t.vercel.app
  ✅ Landing page hiển thị
  ```

- [ ] **Backend health check:**
  ```bash
  curl https://sv5t-backend.onrender.com/health
  ✅ Response: {"status":"OK"}
  ```

- [ ] **API Login test:**
  ```bash
  curl https://sv5t-backend.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"mssv":"2024001001","password":"student123"}'
  ✅ Response: {"success":true,"user":{...},"token":"..."}
  ```

- [ ] **Full flow test:**
  - [ ] Open https://sv5t.vercel.app
  - [ ] Click "Bắt đầu đánh giá ngay"
  - [ ] Enter MSSV: 2024001001
  - [ ] Enter Password: student123
  - [ ] Click "Đăng Nhập"
  - [ ] ✅ Redirect to StudentView
  - [ ] ✅ Data loads from backend
  - [ ] ✅ Can interact with app

- [ ] **Register test:**
  - [ ] Click "Chưa có tài khoản? Đăng ký"
  - [ ] Fill all fields
  - [ ] Click "Đăng Ký"
  - [ ] ✅ Auto login + redirect

- [ ] **Logout test:**
  - [ ] Click logout button
  - [ ] ✅ Redirect to landing page
  - [ ] ✅ localStorage cleared

---

## 🆘 Troubleshooting

### Frontend Deploy Failed
- [ ] Check build logs in Vercel
- [ ] Run `npm run build:production` locally
- [ ] Verify all dependencies installed
- [ ] Check syntax errors

### Backend Deploy Failed
- [ ] Check build logs in Render
- [ ] Verify MONGODB_URI correct
- [ ] Check Node version (should be 18.x)
- [ ] Verify all environment variables set

### CORS Error
- [ ] Update backend CORS config
- [ ] Add Vercel URL to allowed origins
- [ ] Redeploy backend
- [ ] Clear browser cache (Ctrl+Shift+Del)

### API Connection Failed
- [ ] Check backend health: /health endpoint
- [ ] Verify VITE_API_URL in Vercel
- [ ] Check browser console for errors (F12)
- [ ] Check Network tab → XHR requests

### Database Connection Failed
- [ ] Verify MONGODB_URI format
- [ ] Check IP whitelist in MongoDB Atlas
- [ ] Test connection locally with Atlas string
- [ ] Check database user password (no special chars?)

---

## 📊 Monitoring

### Vercel
- [ ] Dashboard → Analytics
- [ ] Monitor response times, errors
- [ ] Check logs if issues

### Render
- [ ] Dashboard → Service → Logs
- [ ] Watch real-time logs during deployment
- [ ] Monitor CPU/Memory usage

### MongoDB Atlas
- [ ] Metrics tab
- [ ] Monitor database size, query performance
- [ ] Check connection pool utilization

---

## 🎉 Final Checks

- [ ] ✅ Frontend URL works: https://sv5t.vercel.app
- [ ] ✅ Backend URL works: https://sv5t-backend.onrender.com
- [ ] ✅ Login/Register working
- [ ] ✅ Database persists data
- [ ] ✅ No console errors
- [ ] ✅ Response times acceptable
- [ ] ✅ Mobile responsive

---

## 📱 Post-Deployment

- [ ] Share URLs with team/users
- [ ] Document production URLs
- [ ] Setup monitoring alerts
- [ ] Plan database backup strategy
- [ ] Monitor costs (Vercel Free, Render Free, MongoDB Atlas Free)
- [ ] Plan future scaling

---

**Status: READY TO DEPLOY** ✅
