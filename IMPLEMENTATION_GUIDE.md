# Hướng Dẫn Hoàn Thiện Hệ Thống Quản Lý Sinh Viên 5 Tốt

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. Backend (Node.js/Express)

#### ✅ Authentication System
- **File**: `server/controllers/authController.js` - CREATED
  - `registerStudent()` - Đăng ký SV với MSSV (10 chữ số) + mật khẩu
  - `loginStudent()` - Đăng nhập SV
  - `loginAdmin()` - Endpoint ẩn `/api/admin/login` (chỉ ADMIN)
  - `getCurrentUser()` - Lấy thông tin user hiện tại
  - Password hashing với bcryptjs (10 salt rounds)
  - JWT token generation (7 ngày expiry)

- **File**: `server/middleware/authMiddleware.js` - CREATED
  - `authenticate` - Verify JWT token
  - `authorize` - Check role-based access
  - `adminOnly` - Admin-only middleware
  - `studentOnly` - Student-only middleware

- **File**: `server/routes/authRoutes.js` - CREATED
  - `POST /api/auth/register` - Đăng ký
  - `POST /api/auth/login` - Đăng nhập
  - `POST /api/auth/admin/login` - Admin login (ẩn)
  - `GET /api/auth/me` - Lấy user hiện tại
  - `POST /api/auth/logout` - Đăng xuất

#### ✅ Database Models
- **File**: `server/models/User.js` - CREATED
  ```javascript
  {
    mssv: String (unique, match: /^\d{10}$/)
    passwordHash: String
    role: String (enum: STUDENT, ADMIN)
    profile: { name, className, faculty, studentType }
    isActive: Boolean
  }
  ```

- **File**: `server/models/Event.js` - CREATED
  ```javascript
  {
    title, description, date
    month, year (indexed)
    categories: [String]
    location, capacity, link
    status, isArchived
  }
  ```

#### ✅ Event Management
- **File**: `server/controllers/eventController.js` - CREATED
  - `getAllEvents()` - Lấy tất cả sự kiện
  - `getEventsByMonth()` - Lấy theo tháng/năm
  - `getUpcomingEvents()` - Sắp tới
  - `getEventArchive()` - Lịch sử
  - `createEvent()` - Tạo (admin)
  - `updateEvent()` - Cập nhật (admin)
  - `deleteEvent()` - Xóa (admin)
  - `archivePastEvents()` - Archive tự động

- **File**: `server/routes/eventRoutes.js` - CREATED
  - Routes công khai cho sinh viên
  - Routes bảo vệ cho admin

#### ✅ Server Configuration
- **File**: `server/server.js` - UPDATED
  - Thêm authRoutes: `app.use('/api/auth', authRoutes)`
  - Thêm eventRoutes: `app.use('/api/events', eventRoutes)`

### 2. Frontend (React/TypeScript)

#### ✅ Type Definitions
- **File**: `types.ts` - UPDATED
  - Thay đổi `UserRole` từ `USER/ADMIN` → `STUDENT/ADMIN`
  - Thêm `AuthCredentials` interface
  - Thêm `AuthResponse` interface
  - Cập nhật `AuthUser` (không có `isGuest`)
  - Cập nhật `UserProfile` (thêm `name`)

#### ✅ Components
- **File**: `components/LandingPage.tsx` - CREATED
  - Hero section
  - Features showcase
  - How it works
  - CTA section
  - Call `onGetStarted()` khi user click nút chính

#### ✅ Services
- **File**: `services/api.js` - UPDATED
  - Thêm `authAPI` object với register, login, adminLogin
  - Thêm axios interceptors cho JWT token
  - Thêm `eventAPI` object
  - Implement automatic token attachment

- **File**: `services/recommendationService.ts` - CREATED
  - `generateRecommendations()` - Gợi ý cá nhân
  - `getCategoryInsight()` - Insight từng tiêu chí
  - Tùy chỉnh khuyến nghị theo:
    - Status hiện tại
    - Loại sinh viên
    - Tiến độ
    - Timeline dự kiến

#### ✅ Views & Dialogs
- **File**: `views/StudentView.tsx` - UPDATED
  - Loại bỏ `isGuest` logic
  - Thêm login requirement khi chưa auth
  - Thay đổi `onLogin()` → `onRequireLogin()`
  - Profile completeness check

### 3. Dependencies
- **File**: `package.json` - UPDATED
  - Thêm `jsonwebtoken: ^9.1.2` (backend JWT)

---

## 🔧 Còn Cần Hoàn Thiện

### 1. App.tsx (Priority: HIGH)
**Mục đích**: Rewrite toàn bộ auth flow

```typescript
// Cần implement:
- State: authUser, showLoginModal, showRegisterModal, showAdminLoginModal
- State: loginForm, registerForm, adminLoginForm
- Handlers:
  - handleStudentLogin() → Call authAPI.login()
  - handleStudentRegister() → Call authAPI.register()
  - handleAdminLogin() → Call authAPI.adminLogin()
  - handleLogout()
- UI:
  - Landing page nếu chưa auth
  - Auth modals
  - Navbar với user info
  - Switch giữa Student/Admin view
```

**Thay đổi chính:**
```tsx
// Cũ (không dùng)
if (currentPage === 'landing' && !authUser) {
  return <LandingPage />;
}

// Mới (login modals)
{showLoginModal && <LoginModal />}
{showRegisterModal && <RegisterModal />}
{showAdminLoginModal && <AdminLoginModal />}
```

### 2. StudentView.tsx (Priority: HIGH)
**Mục đích**: Update UI khi chưa authenticate

```tsx
// Thêm check:
if (!authUser) {
  return <AlertBox onLogin={onRequireLogin} />;
}

// Update EvidenceUploader props:
<EvidenceUploader 
  onRequireAuth={onRequireLogin}
  userId={authUser.id}
/>
```

### 3. EvidenceUploader Component (Priority: MEDIUM)
**Mục đích**: Require login khi submit

```tsx
// Khi user click "Submit Evidence":
if (!authUser) {
  onRequireAuth(); // Call parent handler
  return;
}
// Else: submit evidence
```

### 4. AdminView.tsx (Priority: MEDIUM)
**Mục đích**: Implement admin dashboard

```tsx
// Cần:
- Student management table
- Evidence review panel
- Event management form
- Analytics dashboard
- Export functionality
```

### 5. Recommendations Component (Priority: LOW)
**Mục đích**: Display AI recommendations

```tsx
// Cần component hiển thị:
- Overall insight
- Per-category suggestions
- Action items
- Timeline estimates
```

---

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
npm install
npm install jsonwebtoken   # For backend
```

### 2. Create .env File
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sv5t
JWT_SECRET=sv5t-dev-secret
ADMIN_SECRET=sv5t-admin-dev-secret
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB
```bash
mongod
```

### 4. Start Backend
```bash
npm run server:dev
```

### 5. Start Frontend
```bash
npm run dev
```

---

## 📋 MSSV Validation

### Frontend
```typescript
const isValidMSSV = (mssv: string): boolean => /^\d{10}$/.test(mssv);

// In inputs:
onChange={(e) => {
  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
  setForm({ ...form, mssv: cleaned });
}}
```

### Backend
```javascript
const isValidMSSV = (mssv) => /^\d{10}$/.test(mssv);

if (!isValidMSSV(mssv)) {
  return res.status(400).json({
    success: false,
    error: 'MSSV must be exactly 10 digits'
  });
}
```

---

## 🔐 Security Notes

1. **Password Hashing**: bcryptjs with salt rounds = 10
2. **JWT Tokens**: Expires in 7 days
3. **MSSV Unique**: Database constraint ensures uniqueness
4. **Admin Endpoint**: Returns generic error for non-admin users
5. **Token Storage**: localStorage (frontend)
6. **CORS**: Configured for localhost:5000

---

## 📊 Event System Features

### Month-by-Month Display
```javascript
GET /api/events/month/12/2025
→ Returns all December 2025 events

GET /api/events/archive?limit=50&offset=0
→ Returns paginated historical events
```

### Categories
- `ethics` - Đạo đức, Mác-Lênin
- `study` - Học tập, NCKH
- `physical` - Thể dục
- `volunteer` - Tình nguyện
- `integration` - Hội nhập quốc tế

### Auto-Archiving
```javascript
// Past events automatically marked as archived
POST /api/events/archive/batch (admin only)
```

---

## 🎯 Next Steps (Detailed)

### Step 1: Complete App.tsx (Est. 2-3 hours)
1. Copy code từ phần "Frontend Auth Flow" ở [SYSTEM_SETUP.md](SYSTEM_SETUP.md)
2. Implement all auth handlers
3. Create login/register/admin modals
4. Test with backend endpoints

### Step 2: Update StudentView.tsx (Est. 1 hour)
1. Add auth check at component start
2. Remove `isGuest` logic
3. Update `EvidenceUploader` props
4. Test profile flow

### Step 3: Implement Remaining Components (Est. 4-6 hours)
1. AdminView - Full implementation
2. EvidenceUploader - Auth requirement
3. Recommendation display
4. Event calendar by month

### Step 4: Testing (Est. 2-3 hours)
1. Register new student account
2. Login with MSSV + password
3. Admin login with hidden endpoint
4. Test all protected routes
5. Verify MSSV validation
6. Test event filtering

---

## 🔗 API Reference Quick Links

**Auth**
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin/login` - Admin login (HIDDEN)

**Events**
- `GET /api/events/all` - All events
- `GET /api/events/month/:month/:year` - By month
- `GET /api/events/archive` - Past events
- `POST /api/events` - Create (admin)

**Students**
- `GET /api/students/profile` - Own profile
- `GET /api/students/all` - All (admin)

---

## 📚 Files Created/Modified

### Created:
✅ server/controllers/authController.js
✅ server/middleware/authMiddleware.js
✅ server/routes/authRoutes.js
✅ server/models/User.js
✅ server/models/Event.js
✅ server/controllers/eventController.js
✅ server/routes/eventRoutes.js
✅ components/LandingPage.tsx
✅ services/recommendationService.ts
✅ SYSTEM_SETUP.md

### Modified:
✅ types.ts (UserRole, AuthUser, UserProfile)
✅ services/api.js (authAPI, eventAPI)
✅ package.json (jsonwebtoken)
✅ server/server.js (new routes)
✅ App.tsx (partial - imports updated)
✅ views/StudentView.tsx (partial - auth check)

### Still Need Work:
⏳ App.tsx - Complete auth flow + modals
⏳ views/AdminView.tsx - Full implementation
⏳ components/EvidenceUploader.tsx - Auth requirement
⏳ Recommendations component - Display

---

## ✨ System Ready For

✅ Student registration & login (MSSV + password)
✅ Admin access control (hidden endpoint)
✅ Role-based authorization (backend)
✅ MSSV validation (10 digits, both sides)
✅ Event management (by month, archive)
✅ JWT authentication (7-day tokens)
✅ Landing page
✅ Recommendation service

🚀 **Estimated time to completion: 6-10 hours**
(Subject to complexity of AdminView implementation)
