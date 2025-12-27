# 🚀 STARTUP GUIDE - Khởi Động Hệ Thống

## 🎯 Yêu Cầu

- ✅ Node.js v14+ (đã cài)
- ✅ npm v6+ (đã cài)
- ✅ MongoDB chạy local trên port 27017 (hoặc dùng MongoDB Atlas)
- ✅ .env file có MONGODB_URI

---

## 📋 Các Bước Khởi Động

### **Bước 1: Kiểm Tra MongoDB**

MongoDB có thể chạy cục bộ hoặc dùng MongoDB Atlas. Nếu dùng local, hãy kiểm tra:

```bash
# Nếu cài MongoDB, bắt đầu service
# Windows:
mongod

# macOS (nếu dùng Homebrew):
brew services start mongodb-community
```

**Hoặc nếu dùng MongoDB Atlas (Cloud):**
- Cập nhật MONGODB_URI trong `.env` với connection string từ Atlas

---

### **Bước 2: Terminal 1 - Khởi Động Backend**

```bash
cd D:\Project\SV5T_bydiix
node server/server.js
```

**✅ Kết quả mong đợi:**
```
🚀 Server running on http://localhost:5001
📡 Mongoose connected to MongoDB
✅ MongoDB connected: localhost
📊 Database: sv5t_database
```

---

### **Bước 3: Terminal 2 - Khởi Động Frontend**

```bash
cd D:\Project\SV5T_bydiix
npm run dev
```

**✅ Kết quả mong đợi:**
```
VITE v6.4.1 ready in XXX ms
➜  Local:   http://localhost:3000/
```

---

## 🌐 Truy Cập Ứng Dụng

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5001
- **API Endpoints:** http://localhost:5001/api

---

## 🔑 Tài Khoản Kiểm Thử

### Sinh Viên:
```
MSSV: 2024001001
Mật khẩu: student123
```

### Quản Trị Viên:
```
MSSV: 0000000001
Mật khẩu: admin123
```

---

## ⚙️ Các Script Hữu Ích

```bash
# Khởi động frontend dev
npm run dev

# Build frontend
npm build

# Khởi động backend dev (with nodemon auto-reload)
npm run server:dev

# Khởi động backend production
npm run server

# Seed test accounts vào database
npm run seed

# Chạy tất cả (cần 2+ terminals)
# Terminal 1:
node server/server.js
# Terminal 2:
npm run dev
```

---

## 🆘 Troubleshooting

### ❌ **Lỗi: Port 5000/5001 đã được sử dụng**
```bash
# Kill tất cả Node.js processes
Get-Process -Name node | Stop-Process -Force

# Hoặc dùng port khác
# Sửa .env: PORT=5002
# Sửa services/api.js: API_BASE_URL = 'http://localhost:5002/api'
```

### ❌ **Lỗi: MongoDB connection failed**
```bash
# Kiểm tra .env có MONGODB_URI
# Kiểm tra MongoDB daemon chạy không
# Nếu local: mongod phải chạy
# Nếu Atlas: connection string phải đúng
```

### ❌ **Lỗi: CORS / Cannot connect to server**
```bash
# Đảm bảo backend chạy trên đúng port
# Refresh trình duyệt (Ctrl+R hoặc F5)
# Xóa cache browser (F12 → Network → Disable cache)
# Kiểm tra DevTools console xem error gì
```

### ❌ **Lỗi: Module not found**
```bash
npm install
npm install --legacy-peer-deps
```

---

## 🔍 Kiểm Tra Hệ Thống

### 1. **Kiểm Tra Backend Hoạt Động**
```bash
curl http://localhost:5001/health
# Response: {"status":"OK","timestamp":"..."}
```

### 2. **Kiểm Tra API Kết Nối**
```bash
curl http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mssv":"2024001001","password":"student123"}'
# Response: {"success":true,"user":{...},"token":"..."}
```

### 3. **Kiểm Tra Database**
Cần MongoDB client tool như MongoDB Compass hoặc mongosh để xem dữ liệu.

---

## 📊 Cấu Trúc Port

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3000 | http://localhost:3000 |
| Backend (Express) | 5001 | http://localhost:5001 |
| MongoDB | 27017 | localhost:27017 |

---

## 🎉 Xong!

Khi cả hai server chạy, hãy mở **http://localhost:3000** trong trình duyệt và thử đăng nhập.

**Nếu vẫn gặp lỗi "Lỗi kết nối đến máy chủ":**
1. ✅ Backend chạy trên 5001?
2. ✅ MongoDB kết nối ok?
3. ✅ Frontend có load đúng API URL?
4. ✅ Refresh trình duyệt?
5. ✅ Check DevTools Network tab (F12)?

---

**Last Updated:** December 27, 2025
