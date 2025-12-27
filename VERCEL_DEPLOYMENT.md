# 🚀 VERCEL DEPLOYMENT GUIDE

## 📋 Chuẩn Bị

### Yêu Cầu:
- ✅ GitHub account (kết nối repository)
- ✅ Vercel account (free tier đủ)
- ✅ MongoDB Atlas account (cloud database)
- ✅ Git đã cài đặt

---

## 🛠️ Bước 1: Tối Ưu Local Code

### 1.1 Kiểm Tra Build
```bash
npm run build
```
✅ Đảm bảo không có lỗi build

### 1.2 Kiểm Tra Package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node server/server.js",
    "server:dev": "nodemon server/server.js",
    "start": "npm run server",
    "seed": "node server/seed.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## 🌐 Bước 2: Setup MongoDB Atlas (Cloud)

MongoDB local không thể dùng với Vercel. Phải dùng MongoDB Atlas:

### 2.1 Tạo MongoDB Atlas Account
1. Vào https://www.mongodb.com/cloud/atlas
2. Đăng ký Free account
3. Tạo Organization → Project → Cluster

### 2.2 Tạo Database User
1. Security → Database Access → Add Database User
2. Username: `sv5t_user`
3. Password: `(lưu lại)`

### 2.3 Allow Network Access
1. Security → Network Access → Add IP Address
2. Allow from anywhere: `0.0.0.0/0`

### 2.4 Lấy Connection String
1. Databases → Connect → Connect your application
2. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/sv5t_database?retryWrites=true&w=majority`

---

## 🔑 Bước 3: Setup Environment Variables

### 3.1 Tạo `.env.production`
```dotenv
# MongoDB Atlas
MONGODB_URI=mongodb+srv://sv5t_user:PASSWORD@cluster.mongodb.net/sv5t_database?retryWrites=true&w=majority

# Server
PORT=5001
NODE_ENV=production

# JWT
JWT_SECRET=your-very-secret-key-change-this-in-production
ADMIN_SECRET=your-admin-secret-key-change-this

# API
API_BASE_URL=https://your-vercel-app.vercel.app
REACT_APP_API_URL=https://your-vercel-app.vercel.app/api
```

### 3.2 Update `.env` for Development
```dotenv
MONGODB_URI=mongodb://localhost:27017/sv5t_database
VITE_API_URL=http://localhost:5001/api
```

---

## 📦 Bước 4: Push to GitHub

```bash
# 1. Khởi tạo Git (nếu chưa có)
git init
git add .
git commit -m "Initial commit - SV5T system"

# 2. Tạo repository trên GitHub

# 3. Push code lên
git remote add origin https://github.com/YOUR_USERNAME/sv5t.git
git branch -M main
git push -u origin main
```

---

## 🚀 Bước 5: Deploy Frontend lên Vercel

### 5.1 Connect Repository
1. Vào https://vercel.com/dashboard
2. New Project → Import Git Repository
3. Chọn repository `sv5t`

### 5.2 Configure Project
1. **Framework Preset:** Vite
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Install Command:** `npm install`

### 5.3 Environment Variables
1. Thêm variables:
   ```
   VITE_API_URL = https://your-backend.com/api
   REACT_APP_API_URL = https://your-backend.com/api
   ```

### 5.4 Deploy
1. Click "Deploy"
2. Chờ build hoàn thành (~2-5 phút)

✅ Frontend hoàn thành! Vercel tự động assign URL: `https://sv5t.vercel.app`

---

## 🔧 Bước 6: Deploy Backend

**Tùy chọn A: Sử dụng Render (Recommended)**

### 6.1 Tạo Render Account
1. Vào https://render.com
2. Đăng nhập bằng GitHub

### 6.2 Create New Service
1. Dashboard → New → Web Service
2. Select repository
3. Configure:
   ```
   Name: sv5t-backend
   Environment: Node
   Build Command: npm install
   Start Command: node server/server.js
   Plan: Free (hoặc Starter $7/month)
   ```

### 6.3 Environment Variables
```
MONGODB_URI = mongodb+srv://...
PORT = 10000
NODE_ENV = production
JWT_SECRET = your-secret
ADMIN_SECRET = your-admin-secret
```

### 6.4 Deploy
1. Click "Create Web Service"
2. Chờ build (2-5 phút)
3. Lấy URL: `https://sv5t-backend.onrender.com`

✅ Backend sẵn sàng!

---

**Tùy Chọn B: Dùng Vercel Serverless Functions**

Nếu muốn cả hai trên Vercel, có thể dùng serverless functions:

### 6.1 Tạo API routes
```
/api
  /auth
    /login.js
    /register.js
    /admin-login.js
  /students
    /index.js
  /events
    /index.js
```

Tuy nhiên, cách này phức tạp hơn. **Khuyến nghị: Dùng Render cho backend**

---

## 🔗 Bước 7: Connect Frontend ↔ Backend

### 7.1 Update Frontend Config
Thay đổi `VITE_API_URL` trong Vercel Environment Variables:
```
VITE_API_URL = https://sv5t-backend.onrender.com/api
```

### 7.2 Update CORS (Backend)
File `server/server.js`:
```javascript
app.use(cors({
  origin: ['https://sv5t.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### 7.3 Redeploy Frontend
```bash
git add .
git commit -m "Update API URL for production"
git push
```
✅ Vercel tự động redeploy

---

## ✅ Checklist Deployment

- [ ] Build local hoạt động: `npm run build`
- [ ] MongoDB Atlas setup xong
- [ ] Connection string thử kết nối OK
- [ ] GitHub repository tạo + push code
- [ ] Frontend deployed lên Vercel
- [ ] Backend deployed lên Render
- [ ] CORS config đúng
- [ ] Environment variables trong Vercel
- [ ] Environment variables trong Render
- [ ] Test đăng nhập từ production URL
- [ ] Database seed dữ liệu (từ local hoặc API)

---

## 🧪 Test Production

### 1. Test Frontend
```
https://sv5t.vercel.app
```
✅ Trang landing hiển thị

### 2. Test Backend Health
```
https://sv5t-backend.onrender.com/health
```
✅ Response: `{"status":"OK","timestamp":"..."}`

### 3. Test Login API
```bash
curl https://sv5t-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mssv":"2024001001","password":"student123"}'
```
✅ Response: `{"success":true,"user":{...},"token":"..."}`

### 4. Test Full Flow
1. Mở https://sv5t.vercel.app
2. Click "Bắt đầu đánh giá ngay"
3. Đăng nhập: MSSV `2024001001`, Mật khẩu `student123`
4. ✅ Redirect đến StudentView

---

## 📊 Cấu Trúc Deployment

```
GitHub Repository
    ├── Frontend Code (React/Vite)
    │   └── Deploy → Vercel → https://sv5t.vercel.app
    │
    ├── Backend Code (Express/Node)
    │   └── Deploy → Render → https://sv5t-backend.onrender.com
    │
    └── Shared Config (.env, package.json, etc)

Production Environment:
    Frontend (Vercel) ←→ API Calls ←→ Backend (Render) ←→ MongoDB Atlas
```

---

## 🚨 Troubleshooting

### ❌ CORS Error
**Problem:** `Access to XMLHttpRequest blocked by CORS`

**Solution:**
```javascript
// server/server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sv5t.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

### ❌ 502 Bad Gateway
**Problem:** Backend không respond

**Solution:**
- Kiểm tra Render logs
- Verify MONGODB_URI
- Check PORT variable
- Restart service

### ❌ "Cannot find module"
**Problem:** Dependencies missing

**Solution:**
```bash
# Render:
npm install

# Vercel:
npm install --legacy-peer-deps
```

### ❌ Timeout
**Problem:** Request timeout

**Solution:**
- Check backend logs
- Increase Vercel function timeout (max 60s)
- Use Render Starter plan (more resources)

---

## 🔐 Security Best Practices

1. ✅ **Never commit .env**
   ```bash
   echo ".env" >> .gitignore
   ```

2. ✅ **Change JWT Secrets**
   ```env
   JWT_SECRET=generate-random-string-here
   ADMIN_SECRET=generate-another-random-string
   ```

3. ✅ **Enable HTTPS** (Both Vercel & Render do this)

4. ✅ **Rate Limiting** (TODO: Implement)

5. ✅ **Input Validation** (Already done in backend)

---

## 📈 Performance Optimization

### Frontend (Vercel)
- ✅ Code splitting (Vite automatic)
- ✅ Image optimization (use next/image if migrate to Next.js)
- ✅ Minification (automatic)

### Backend (Render)
- ✅ Connection pooling (Mongoose default)
- ✅ Caching headers
- ✅ Compression (gzip)

### Database (MongoDB Atlas)
- ✅ Indexing on frequently queried fields
- ✅ Connection pooling
- ✅ Regular backups

---

## 🔄 CI/CD Pipeline

Vercel automatically deploys on:
- Push to `main` branch
- Pull request created
- Manual trigger from dashboard

---

## 📞 Support & Monitoring

### Vercel Analytics
- Dashboard → Analytics
- Monitor performance, errors, real-time traffic

### Render Logs
- Dashboard → Service → Logs
- Real-time server logs, errors

### MongoDB Atlas
- Metrics tab for database performance

---

**🎉 Deployment Complete!**

Your SV5T system is now live on the internet!

- 🌐 Frontend: https://sv5t.vercel.app
- 🔧 Backend: https://sv5t-backend.onrender.com
- 📊 Database: MongoDB Atlas

---

**Last Updated:** December 27, 2025
