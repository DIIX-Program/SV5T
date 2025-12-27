# 🧪 HƯỚNG DẪN KIỂM THỬHỆ THỐNG ĐĂNG NHẬP

## ✅ Tài Khoản Sinh Viên

### Sinh Viên 1 - Ngành Công Nghệ Thông Tin
```
MSSV:        2024001001
Mật khẩu:    student123
Họ tên:      Nguyễn Văn A
Lớp:         CNTT-K65
Khoa:        Công nghệ thông tin
Loại:        Đại học
```

### Sinh Viên 2 - Ngành Công Nghệ Thông Tin
```
MSSV:        2024001002
Mật khẩu:    student123
Họ tên:      Trần Thị B
Lớp:         CNTT-K65
Khoa:        Công nghệ thông tin
Loại:        Đại học
```

### Sinh Viên 3 - Ngành Quản Lý Kinh Doanh
```
MSSV:        2024002001
Mật khẩu:    student123
Họ tên:      Lê Hoàng C
Lớp:         QLKD-K65
Khoa:        Quản lý kinh doanh
Loại:        Cao đẳng
```

---

## 🔐 Tài Khoản Quản Trị Viên

### Admin 1
```
MSSV:        0000000001
Mật khẩu:    admin123
Họ tên:      Phạm Thị Admin
Phòng:       Phòng Quản lý
```

### Admin 2
```
MSSV:        0000000002
Mật khẩu:    admin123
Họ tên:      Võ Văn Hệ Thống
Phòng:       Phòng IT
```

---

## 🚀 Các Bước Kiểm Thử

### 1. **Chạy Backend Server**
```bash
# Terminal 1
cd D:\Project\SV5T_bydiix\server
npm run server:dev
# hoặc
nodemon server/server.js
```
✓ Server chạy trên http://localhost:5000

### 2. **Chạy Frontend**
```bash
# Terminal 2
cd D:\Project\SV5T_bydiix
npm run dev
# hoặc
npm run dev -- --port 3000
```
✓ Frontend chạy trên http://localhost:3000 (hoặc http://localhost:5173)

### 3. **Test Đăng Nhập Sinh Viên**
1. Mở http://localhost:3000
2. Click "Bắt đầu đánh giá ngay"
3. Chọn "Đăng Nhập" (mặc định là Login)
4. Nhập:
   - MSSV: `2024001001`
   - Mật khẩu: `student123`
5. Click "Đăng Nhập"

✅ **Kết quả mong đợi:**
- Được chuyển hướng đến Student View
- Hiển thị MSSV ở navbar
- Có nút Đăng xuất

### 4. **Test Đăng Ký Sinh Viên Mới**
1. Mở http://localhost:3000
2. Click "Bắt đầu đánh giá ngay"
3. Click "Chưa có tài khoản? Đăng ký"
4. Điền thông tin:
   - MSSV: `2024999999`
   - Họ tên: `Nguyễn Văn D`
   - Lớp: `CNTT-K66`
   - Khoa: `CNTT`
   - Loại: `Đại học`
   - Mật khẩu: `test123`
   - Xác nhận: `test123`
5. Click "Đăng Ký"

✅ **Kết quả mong đợi:**
- Đăng ký thành công
- Tự động đăng nhập
- Chuyển hướng đến Student View

### 5. **Test Đăng Nhập Quản Trị Viên**
1. Mở http://localhost:3000
2. Click "Bắt đầu đánh giá ngay"
3. **Click lần thứ 2** để mở AuthModal (không có button Admin, dùng modal)
4. Hoặc: Mở modal đăng nhập, tìm cách chọn "admin" mode
   - **Cách hiện tại:** Không có UI button, cần code thêm hoặc test bằng API

**Tạm thời test bằng cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "mssv": "0000000001",
    "password": "admin123"
  }'
```

✅ **Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Đăng nhập quản trị viên thành công",
  "user": {
    "id": "...",
    "mssv": "0000000001",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6. **Test Lỗi Đăng Nhập**

**Test 1: MSSV sai**
```
MSSV: 9999999999
Mật khẩu: student123
```
❌ Kết quả: "MSSV hoặc mật khẩu không chính xác"

**Test 2: Mật khẩu sai**
```
MSSV: 2024001001
Mật khẩu: wrongpass
```
❌ Kết quả: "MSSV hoặc mật khẩu không chính xác"

**Test 3: MSSV không đủ 10 chữ số**
```
MSSV: 202400
Mật khẩu: student123
```
❌ Kết quả: "MSSV phải có 10 chữ số"

**Test 4: Mật khẩu quá ngắn (Register)**
```
Mật khẩu: 123
```
❌ Kết quả: "Mật khẩu phải có ít nhất 6 ký tự"

**Test 5: MSSV đã tồn tại (Register)**
```
MSSV: 2024001001  (đã tồn tại)
Mật khẩu: newpass
Xác nhận: newpass
```
❌ Kết quả: "MSSV đã được đăng ký"

---

## 📝 Checklist Kiểm Thử

### Đăng Ký
- [ ] Đăng ký với đầy đủ thông tin - ✅ thành công
- [ ] Đăng ký MSSV đã tồn tại - ❌ lỗi
- [ ] Đăng ký mật khẩu < 6 ký tự - ❌ lỗi
- [ ] Đăng ký mật khẩu không khớp - ❌ lỗi
- [ ] MSSV không 10 chữ số - ❌ lỗi

### Đăng Nhập Sinh Viên
- [ ] Đăng nhập đúng thông tin - ✅ thành công
- [ ] Đăng nhập MSSV sai - ❌ lỗi
- [ ] Đăng nhập mật khẩu sai - ❌ lỗi
- [ ] Token lưu localStorage - ✅ có
- [ ] Hiển thị MSSV trên navbar - ✅ có

### Đăng Nhập Quản Trị Viên
- [ ] Đăng nhập với tài khoản admin - ✅ thành công
- [ ] Chỉ admin được đăng nhập - ✅ đúng
- [ ] Chuyển sang Admin view - ✅ có

### Đăng Xuất
- [ ] Click "Đăng xuất" - ✅ logout
- [ ] Clear localStorage - ✅ có
- [ ] Quay về Landing Page - ✅ có

### User Interface
- [ ] Modal đẹp & responsive - ✅ có
- [ ] Show/hide password - ✅ có
- [ ] Toggle Login/Register - ✅ có
- [ ] Error messages rõ ràng - ✅ có
- [ ] Loading state - ✅ có

---

## 🔧 Troubleshooting

### ❌ Lỗi "Cannot find module"
```bash
npm install --legacy-peer-deps
```

### ❌ Port 5000 đã được sử dụng
```bash
# Thay đổi port trong .env hoặc server.js
PORT=5001
```

### ❌ MongoDB không kết nối
- Kiểm tra MONGODB_URI trong .env
- Kiểm tra MongoDB daemon đang chạy
- Test connection: `mongosh "mongodb://localhost:27017"`

### ❌ Token hết hạn
- Token có hiệu lực 7 ngày
- Cần đăng nhập lại sau hết hạn
- Hoặc xóa localStorage.sv5t_token

### ❌ CORS lỗi
- Backend đã config CORS
- Kiểm tra frontend API_BASE_URL

---

## 📊 API Endpoints Test

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mssv": "2024999999",
    "password": "test123",
    "name": "Test User",
    "className": "CNTT-K66",
    "faculty": "CNTT",
    "studentType": "UNIVERSITY"
  }'
```

### Login Student
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mssv": "2024001001",
    "password": "student123"
  }'
```

### Login Admin
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "mssv": "0000000001",
    "password": "admin123"
  }'
```

---

## ⏱️ Thời Gian Kiểm Thử

- **Đăng nhập:** ~2 phút
- **Đăng ký:** ~3 phút
- **Kiểm thử lỗi:** ~5 phút
- **UI/UX:** ~5 phút
- **Total:** ~15 phút

---

**✅ Nếu tất cả test pass → Hệ thống sẵn sàng! 🚀**
