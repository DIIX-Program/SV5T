# 🚀 DEPLOYMENT QUICK REFERENCE

## 3 Bước Deployment Nhanh

### 1️⃣ GitHub
```bash
git add .
git commit -m "Deployment: optimize for Vercel"
git push origin main
```

### 2️⃣ Vercel Frontend
```
1. vercel.com → New Project
2. Import GitHub repo
3. Deploy
4. Note URL: https://sv5t.vercel.app
5. Add env: VITE_API_URL = https://sv5t-backend.onrender.com/api
```

### 3️⃣ Render Backend
```
1. render.com → New Web Service
2. Select same GitHub repo
3. Build: npm install
4. Start: node server/server.js
5. Add env: MONGODB_URI (from Atlas)
6. Deploy
7. Note URL: https://sv5t-backend.onrender.com
```

---

## 🔑 Cần Chuẩn Bị

| Item | Status | Link |
|------|--------|------|
| GitHub Account | ✅ | https://github.com |
| Vercel Account | ✅ | https://vercel.com |
| Render Account | ✅ | https://render.com |
| MongoDB Atlas | ✅ | https://mongodb.com/cloud/atlas |
| .env file | ✅ | See below |

---

## 📝 Environment Variables

### .env (Local Development)
```env
MONGODB_URI=mongodb://localhost:27017/sv5t_database
VITE_API_URL=http://localhost:5001/api
NODE_ENV=development
JWT_SECRET=dev-secret-key
ADMIN_SECRET=dev-admin-secret
```

### MongoDB Atlas (Production)
Get from: https://cloud.mongodb.com → Databases → Connect

```env
MONGODB_URI=mongodb+srv://sv5t_user:PASSWORD@cluster.mongodb.net/sv5t_database?retryWrites=true&w=majority
```

### Vercel Environment Variables
```
VITE_API_URL = https://sv5t-backend.onrender.com/api
REACT_APP_API_URL = https://sv5t-backend.onrender.com/api
```

### Render Environment Variables
```
MONGODB_URI = (MongoDB Atlas connection string)
NODE_ENV = production
JWT_SECRET = (change this!)
ADMIN_SECRET = (change this!)
```

---

## 🧪 Test Checklist

```bash
# 1. Local build
npm run build:production
npm run preview

# 2. Push to GitHub
git push

# 3. Test Frontend
curl https://sv5t.vercel.app

# 4. Test Backend
curl https://sv5t-backend.onrender.com/health

# 5. Test API
curl https://sv5t-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mssv":"2024001001","password":"student123"}'

# 6. Test Full Flow
# Open https://sv5t.vercel.app and login
```

---

## ⚡ Performance Tips

### Build Size
```bash
npm run build  # Check bundle size
```

### Database Optimization
- Create indexes on frequently queried fields
- Use connection pooling (Mongoose default)

### Frontend Optimization
- Already: Code splitting, minification, tree-shaking
- Vite handles most optimizations

---

## 🔒 Security Checklist

- [ ] Never commit .env
- [ ] Change JWT_SECRET in production
- [ ] Change ADMIN_SECRET in production
- [ ] Use HTTPS (automatic with Vercel & Render)
- [ ] Whitelist Vercel URL in backend CORS
- [ ] MongoDB Atlas: IP whitelist (0.0.0.0/0 for testing, restrict in prod)

---

## 📊 URLs After Deployment

```
Frontend:  https://sv5t.vercel.app
Backend:   https://sv5t-backend.onrender.com
Database:  MongoDB Atlas (no public URL)
```

---

## 🆘 Quick Fixes

| Issue | Fix |
|-------|-----|
| Build fails | Check logs, run `npm install --legacy-peer-deps` |
| CORS error | Update `origin` in `server.js`, redeploy backend |
| API 404 | Check `VITE_API_URL` in Vercel env vars |
| MongoDB fails | Verify connection string, IP whitelist |
| Deploy timeout | Increase build timeout in Vercel settings |

---

## 📱 Monitoring

```
Vercel:  vercel.com → Dashboard → Analytics
Render:  render.com → Services → Logs
MongoDB: cloud.mongodb.com → Metrics
```

---

**Next: Follow DEPLOYMENT_CHECKLIST.md for detailed steps**
