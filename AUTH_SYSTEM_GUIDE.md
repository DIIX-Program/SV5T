# 🔐 HỆ THỐNG ĐĂNG NHẬP MỚI

## Tổng Quan

Hệ thống đăng nhập đã được hoàn toàn thiết kế lại với:
- ✅ Giao diện Modal hiện đại
- ✅ Xác thực backend chứng thực
- ✅ Validation bên trước & bên sau
- ✅ Xử lý lỗi chi tiết (Tiếng Việt)
- ✅ Hỗ trợ Sinh viên + Quản trị viên
- ✅ Token JWT an toàn

---

## 📱 Các Chế Độ Đăng Nhập

### 1. **Đăng Nhập Sinh Viên**
- **MSSV:** Phải có 10 chữ số
- **Mật khẩu:** Ít nhất 6 ký tự
- **Endpoint:** `POST /api/auth/login`
- **Trả về:** Token JWT + Thông tin người dùng

### 2. **Đăng Ký Sinh Viên (Mới)**
- **Bắt buộc:** MSSV, Mật khẩu, Họ tên, Lớp, Khoa
- **Loại sinh viên:** Đại học / Cao đẳng
- **Endpoint:** `POST /api/auth/register`
- **Xác nhận:** Mật khẩu phải khớp

### 3. **Đăng Nhập Quản Trị Viên**
- **MSSV:** 10 chữ số (ID quản trị viên)
- **Mật khẩu:** 6+ ký tự
- **Endpoint:** `POST /api/auth/admin/login` (Ẩn, không hiển thị)
- **Bảo mật:** Chỉ chấp nhận tài khoản có role ADMIN

---

## 🎯 Luồng Sử Dụng

### Khi chưa đăng nhập:
```
Landing Page
    ↓
Button "Bắt đầu đánh giá ngay"
    ↓
AuthModal (mode: login)
    ↓
Có thể chuyển sang Register
```

### Khi đã đăng nhập:
```
Navbar hiển thị:
  - MSSV người dùng
  - Role (Sinh viên / Quản trị viên)
  - Button Đăng xuất
  - (Admin: Toggle Student/Admin view)
```

---

## 🔧 Cấu Trúc Code

### Component: `AuthModal.tsx`
- **Props:** `isOpen`, `onClose`, `onLoginSuccess`, `mode`
- **States:**
  - `mssv`, `password`, `confirmPassword`
  - `name`, `className`, `faculty`, `studentType` (Register)
  - `error`, `loading`, `showPassword`, `showConfirm`

**Tính năng:**
- Validation real-time
- Show/hide password
- Toggle giữa Login/Register
- Loading state
- Error messages (Tiếng Việt)

### Backend: `authController.js`

#### `registerStudent()`
```javascript
POST /api/auth/register
Body: {
  mssv: "1234567890",
  password: "password123",
  name: "Nguyễn Văn A",
  className: "CNTT-K65",
  faculty: "Công nghệ thông tin",
  studentType: "UNIVERSITY"
}

Response: {
  success: true,
  user: { id, mssv, role },
  token: "eyJhbGc..."
}
```

#### `loginStudent()`
```javascript
POST /api/auth/login
Body: {
  mssv: "1234567890",
  password: "password123"
}

Response: {
  success: true,
  user: { id, mssv, role },
  token: "eyJhbGc..."
}
```

#### `loginAdmin()`
```javascript
POST /api/auth/admin/login
Body: {
  mssv: "9999999999",  // Admin MSSV
  password: "admin_pass"
}

Response: {
  success: true,
  user: { id, mssv, role: "ADMIN" },
  token: "eyJhbGc..." (Admin token)
}
```

---

## 🛡️ Validation & Bảo Mật

### Frontend Validation:
```
MSSV:
  ✓ Phải có chính xác 10 chữ số
  ✓ Chỉ nhập số (auto-filter)
  ✓ Max length: 10

Mật khẩu:
  ✓ Ít nhất 6 ký tự
  ✓ Xác nhận phải khớp (Register)
  ✓ Show/hide toggle

Profile (Register):
  ✓ Họ tên: Không để trống
  ✓ Lớp: Không để trống
  ✓ Khoa: Không để trống
```

### Backend Validation:
```
MSSV:
  ✓ Regex: /^\d{10}$/
  ✓ Unique check
  ✓ Role-specific check (ADMIN)

Mật khẩu:
  ✓ Minimum 6 characters
  ✓ Bcrypt hash (salt rounds: 10)
  ✓ Never send plain text

Token:
  ✓ JWT với expiry 7 ngày
  ✓ Separate secrets: JWT_SECRET vs ADMIN_SECRET
```

---

## 💾 LocalStorage

```javascript
sv5t_token      // JWT token
sv5t_user       // { id, mssv, role }
sv5t_profile    // { userId, mssv, name, ... }
sv5t_criteria   // Evaluation data
sv5t_submissions // Evidence
sv5t_events     // Events
sv5t_users      // User list (admin)
```

---

## 🔄 API Client (`api.js`)

```javascript
// Auto-attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv5t_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sv5t_token');
      localStorage.removeItem('sv5t_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 Test Cases

### Test Đăng Ký:
```javascript
// ✅ Valid
POST /api/auth/register
{
  mssv: "2024001001",
  password: "Test123",
  name: "Hoàng Văn B",
  className: "CNTT-K65",
  faculty: "KHMT",
  studentType: "UNIVERSITY"
}

// ❌ MSSV không đủ 10 chữ số
{
  mssv: "2024001"
  // Error: "MSSV phải có 10 chữ số"
}

// ❌ Mật khẩu quá ngắn
{
  password: "123"
  // Error: "Mật khẩu phải có ít nhất 6 ký tự"
}

// ❌ MSSV đã tồn tại
// Response 409: "MSSV đã được đăng ký"
```

### Test Đăng Nhập:
```javascript
// ✅ Valid
POST /api/auth/login
{
  mssv: "2024001001",
  password: "Test123"
}

// ❌ MSSV không tồn tại
// Response 401: "MSSV hoặc mật khẩu không chính xác"

// ❌ Mật khẩu sai
// Response 401: "MSSV hoặc mật khẩu không chính xác"
```

### Test Admin Login:
```javascript
// ✅ Valid (nếu là ADMIN)
POST /api/auth/admin/login
{
  mssv: "0000000001",
  password: "admin123"
}

// ❌ Không phải ADMIN
// Response 401: "Thông tin xác thực không hợp lệ"
```

---

## 📋 Checklist Triển Khai

- [ ] Backend MongoDB chạy
- [ ] Tạo tài khoản ADMIN trong DB
- [ ] Set JWT_SECRET, ADMIN_SECRET trong .env
- [ ] Test đăng ký sinh viên
- [ ] Test đăng nhập sinh viên
- [ ] Test admin login
- [ ] Verify token verify
- [ ] Test logout
- [ ] Kiểm tra localStorage
- [ ] Test role-based access

---

## 🚀 Cải Tiến Trong Tương Lai

1. **Email Verification:** Xác thực qua email trước khi active
2. **2FA:** Two-factor authentication
3. **Password Reset:** Quên mật khẩu
4. **Social Login:** Google/Facebook
5. **Rate Limiting:** Prevent brute force
6. **Session Management:** Logout từ tất cả devices
7. **Audit Log:** Ghi lại login attempts
8. **LDAP Integration:** Kết nối với hệ thống đại học

---

## ❓ FAQ

**Q: Nếu quên mật khẩu?**
A: Hiện tại không có tính năng reset. (TODO: implement password reset)

**Q: Token hết hạn làm sao?**
A: Token có hiệu lực 7 ngày. Sau đó cần đăng nhập lại.

**Q: Quản trị viên đăng nhập ở đâu?**
A: Cùng modal nhưng chọn mode "admin", đúng endpoint /api/auth/admin/login

**Q: Dữ liệu lưu đâu?**
A: Backend: MongoDB. Frontend: localStorage + React state.

---

**Last Updated:** December 2025
