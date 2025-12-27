# 🚀 CÁCH CHẠY HỆ THỐNG (Local Development)

## ⚡ Cách Nhanh Nhất (2 Terminal)

### **Terminal 1 - Backend**
```bash
cd D:\Project\SV5T_bydiix
node server/server.js
```

**Kết quả:**
```
🚀 Server running on http://localhost:5001
📡 Mongoose connected to MongoDB
✅ MongoDB connected: localhost
📊 Database: sv5t_database
```

### **Terminal 2 - Frontend**
```bash
cd D:\Project\SV5T_bydiix
npm run dev
```

**Kết quả:**
```
VITE v6.4.1 ready in XXX ms
➜  Local:   http://localhost:3000/
```

---

## ✅ Truy Cập

Mở trình duyệt: **http://localhost:3000**

---

## 🔑 Tài Khoản Test

### Sinh Viên:
- MSSV: `2024001001`
- Mật khẩu: `student123`

### Admin:
- MSSV: `0000000001`
- Mật khẩu: `admin123`

---

## 📋 Các Lệnh Hữu Ích

```bash
# Frontend
npm run dev              # Chạy dev server (port 3000)
npm run build           # Build production
npm run preview         # Preview build

# Backend
npm run server:dev      # Chạy backend với auto-reload (nodemon)
npm run server          # Chạy backend bình thường
npm run seed            # Tạo test accounts

# Both
npm run build:production # Build optimized cho production
npm run analyze          # Build + preview
```

---

## 🔧 Yêu Cầu

✅ **Node.js v18+**
```bash
node --version
# v24.11.1
```

✅ **npm v8+**
```bash
npm --version
# 10.x.x
```

✅ **MongoDB** (running locally hoặc dùng MongoDB Atlas)
- Local: port 27017
- Atlas: connection string trong `.env`

---

## 📁 Cấu Trúc Thư Mục

```
D:\Project\SV5T_bydiix\
├── .env                    # Environment variables
├── server/
│   ├── server.js          # Backend entry point
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   └── models/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── views/
│   └── services/
├── vite.config.ts
└── package.json
```

---

## 🆘 Nếu Có Lỗi

### ❌ "Port 3000/5001 đã được sử dụng"
```bash
# Kill tất cả Node processes
Get-Process -Name node | Stop-Process -Force

# Hoặc dùng port khác
# .env: PORT=5002
```

### ❌ "MongoDB connection failed"
- Kiểm tra MongoDB chạy: `mongod`
- Kiểm tra `.env` có `MONGODB_URI` không
- Nếu dùng Atlas: connection string phải đúng

### ❌ "Cannot find module"
```bash
npm install
npm install --legacy-peer-deps
```

### ❌ "CORS error / Lỗi kết nối"
- Backend chạy trên 5001? ✅
- Frontend config API URL đúng? ✅
- Refresh trình duyệt (Ctrl+R)
- Check F12 → Console xem lỗi gì

---

## 🎯 Workflow

```
1. Mở Terminal 1 → npm run server:dev (backend)
2. Mở Terminal 2 → npm run dev (frontend)
3. Frontend auto reload khi file thay đổi
4. Backend auto reload khi file thay đổi (nodemon)
5. Mở http://localhost:3000
6. Thử đăng nhập → Xem console để debug
```

---

## 💡 Tips

- **Hotkey Vite:** Bấm `h + Enter` trong terminal frontend để xem shortcuts
- **DevTools:** Bấm F12 để debug frontend (Console, Network, etc)
- **Nodemon:** Tự động restart backend khi file thay đổi
- **HMR:** Hot Module Replacement - frontend reload ngay khi edit

---

## 📊 Kiểm Tra Hoạt Động

```bash
# Terminal 3: Kiểm tra backend
curl http://localhost:5001/health
# Response: {"status":"OK"}

# Hoặc test login
curl http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mssv":"2024001001","password":"student123"}'
# Response: {"success":true,"user":{...},"token":"..."}
```

---

## 🔄 Restart Services

### Frontend crashed?
```bash
# Terminal 2: Ctrl+C để stop
# Rồi: npm run dev
```

### Backend crashed?
```bash
# Terminal 1: Ctrl+C để stop
# Rồi: npm run server:dev
```

### MongoDB down?
```bash
# Start MongoDB
mongod
```

---

## 📝 .env File

```dotenv
# Cần có file này!
MONGODB_URI=mongodb://localhost:27017/sv5t_database
VITE_API_URL=http://localhost:5001/api
NODE_ENV=development
JWT_SECRET=dev-secret
ADMIN_SECRET=dev-admin-secret
PORT=5001
```

---

## ✅ Checklist Trước Chạy

- [ ] File `.env` tồn tại
- [ ] `node_modules/` tồn tại (nếu không chạy `npm install`)
- [ ] MongoDB chạy (nếu dùng local)
- [ ] Port 3000, 5001 không bị chiếm
- [ ] Git (nếu muốn dùng `git log`)

---

## 🎉 Done!

Hệ thống sẵn sàng chạy! 

```bash
npm run server:dev   # Terminal 1
npm run dev          # Terminal 2
```

Rồi mở **http://localhost:3000**! 🚀
