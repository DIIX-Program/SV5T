# Quản Lý Sinh Viên 5 Tốt - Hướng Dẫn Triển Khai

## Tổng Quan Hệ Thống

Hệ thống "Quản Lý Sinh Viên 5 Tốt" được xây dựng với kiến trúc rõ ràng, bảo mật theo role, và dễ mở rộng.

### Các Tính Năng Chính

1. **Trang Landing** - Giao diện tối giản, nút hành động chính "Mức độ sẵn sàng cho Sinh viên 5 Tốt"
2. **Xác Thực & Phân Quyền**
   - Sinh viên: Đăng ký/đăng nhập bằng MSSV (10 chữ số) + mật khẩu
   - Admin: Endpoint ẩn `/api/admin/login` (chỉ role ADMIN)
   - Không có chế độ khách
3. **Đánh Giá Tiêu Chí** - 5 tiêu chí: Đạo đức, Học tập, Sức khỏe, Tình nguyện, Hội nhập
4. **Khuyến Nghị** - Gợi ý cá nhân hóa dựa trên hồ sơ và minh chứng
5. **Hệ Thống Sự Kiện** - Hiển thị theo tháng, lưu trữ lịch sử đầy đủ
6. **Panel Quản Trị** - Quản lý sinh viên, duyệt minh chứng, phân tích dữ liệu

---

## Kiến Trúc Hệ Thống

```
┌─────────────────┐
│  React Frontend │
├─────────────────┤
│ LandingPage     │
│ AuthModals      │
│ StudentView     │
│ AdminView       │
└────────┬────────┘
         │ API Calls
         ↓
┌─────────────────────────────────────┐
│    Express Backend                  │
├─────────────────────────────────────┤
│ Routes:                             │
│  - /api/auth/* (Login/Register)     │
│  - /api/students/* (Student data)   │
│  - /api/events/* (Event management) │
│  - /api/analytics/* (Analytics)     │
├─────────────────────────────────────┤
│ Middleware:                         │
│  - authenticate (JWT verify)        │
│  - authorize (Role-based)           │
│  - adminOnly, studentOnly           │
├─────────────────────────────────────┤
│ Models:                             │
│  - User (MSSV, password, role)      │
│  - Event (with month/year index)    │
│  - Student (profile, criteria)      │
│  - Submission (evidence tracking)   │
└────────┬────────────────────────────┘
         │ MongoDB Driver
         ↓
┌─────────────────┐
│    MongoDB      │
├─────────────────┤
│ Collections:    │
│  - users        │
│  - events       │
│  - submissions  │
└─────────────────┘
```

---

## Setup và Cài Đặt

### 1. Yêu Cầu Hệ Thống
- Node.js >= 16
- MongoDB (local hoặc cloud)
- npm hoặc yarn

### 2. Cài Đặt Dependencies

```bash
# Frontend dependencies đã có trong package.json
npm install

# Thêm jsonwebtoken nếu chưa có
npm install jsonwebtoken
```

### 3. Environment Variables

Tạo file `.env` ở thư mục root:

```env
# Server config
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/sv5t
# Hoặc MongoDB Atlas
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/sv5t

# JWT
JWT_SECRET=sv5t-secret-key-change-in-production
ADMIN_SECRET=sv5t-admin-secret-change-in-production

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Khởi Động Hệ Thống

```bash
# Terminal 1: MongoDB (nếu local)
mongod

# Terminal 2: Backend Server
npm run server:dev

# Terminal 3: Frontend (Vite dev server)
npm run dev
```

---

## MSSV Validation

### Frontend (TypeScript/React)
```typescript
const isValidMSSV = (mssv: string): boolean => /^\d{10}$/.test(mssv);
```

### Backend (JavaScript)
```javascript
const isValidMSSV = (mssv) => /^\d{10}$/.test(mssv);

// Mongoose Schema
mssv: {
  type: String,
  required: true,
  unique: true,
  match: /^\d{10}$/
}
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/register
  { mssv, password, name, className, faculty, studentType }
  → { success, user, token }

POST   /api/auth/login
  { mssv, password }
  → { success, user, token }

POST   /api/auth/admin/login (HIDDEN)
  { mssv, password }
  → { success, user, token } (only ADMIN role accepted)

GET    /api/auth/me (Protected)
  Headers: { Authorization: Bearer <token> }
  → { success, user }

POST   /api/auth/logout (Protected)
```

### Students

```
GET    /api/students/profile (Protected, STUDENT)
  → { success, profile }

GET    /api/students/all (Protected, ADMIN)
  → { success, students }

GET    /api/students/:id (Protected, ADMIN)
  → { success, student }
```

### Events

```
GET    /api/events/all (Public)
  Query: { month?, year?, status?, category? }
  → { success, events }

GET    /api/events/upcoming (Public)
  Query: { limit? }
  → { success, events }

GET    /api/events/month/:month/:year (Public)
  → { success, events, total }

GET    /api/events/archive (Public)
  Query: { limit?, offset? }
  → { success, events, total }

POST   /api/events (Protected, ADMIN)
  { title, description, date, categories, location, capacity, link }
  → { success, event }

PUT    /api/events/:id (Protected, ADMIN)
  → { success, event }

DELETE /api/events/:id (Protected, ADMIN)
  → { success }
```

---

## Security Features

### Authentication
- JWT tokens với expiry 7 ngày
- Password hashing với bcryptjs (salt rounds: 10)
- Token stored trong localStorage (frontend)
- Token sent via Authorization header

### Authorization
- Backend-only role checks
- Middleware prevents unauthorized access
- Admin endpoint `/api/admin/login` rejects non-ADMIN users
- MSSV validation on both frontend & backend

### Data Protection
- Unique MSSV constraint in MongoDB
- Password never returned in responses
- Sensitive errors don't leak information
- CORS enabled cho localhost:5000

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  mssv: String (unique, regex: /^\d{10}$/),
  passwordHash: String,
  role: String (enum: ['STUDENT', 'ADMIN']),
  profile: {
    name: String,
    className: String,
    faculty: String,
    studentType: String (enum: ['UNIVERSITY', 'COLLEGE'])
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  month: Number (1-12, indexed),
  year: Number,
  categories: [String],
  location: String,
  registeredCount: Number,
  capacity: Number,
  link: String,
  status: String (enum: ['upcoming', 'ongoing', 'completed', 'cancelled']),
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Component Structure

### Frontend Components
```
App.tsx (Main - handles auth state and routing)
├── LandingPage (Initial page for guests)
│   ├── Hero Section
│   ├── Features Section
│   ├── How it Works Section
│   ├── CTA Section
│   └── Auth Modals (Login, Register, Admin Login)
│
├── StudentView (STUDENT role)
│   ├── Profile Input (if not set)
│   ├── Criteria Form
│   ├── Result Dashboard
│   ├── Recommendations
│   ├── Evidence Uploader
│   └── Events Calendar
│
└── AdminView (ADMIN role)
    ├── Student Management
    ├── Evidence Review
    ├── Event Management
    ├── Analytics Dashboard
    └── Export Functions
```

### Services
```
services/
├── api.js (API client with axios interceptors)
├── evaluationService.ts (Readiness scoring)
├── recommendationService.ts (AI suggestions)
├── dataAnalyticsService.ts (Analytics)
└── evaluationService.ts (Core evaluation logic)
```

---

## Frontend Auth Flow

1. **Landing Page** → User clicks "Mức độ sẵn sàng cho Sinh viên 5 Tốt"
2. **Login/Register Modal** → User chooses action
3. **Backend Validation** → MSSV + password validation
4. **Token Storage** → JWT stored in localStorage
5. **Profile Input** → User enters basic info (if new)
6. **Student View** → Access readiness assessment

---

## Admin Access

### Hidden Admin Endpoint

```
/api/admin/login (POST)
  Body: { mssv, password }
  Response: ONLY if user.role === 'ADMIN'
```

### Frontend
- Admin button on bottom-right (dev only, can be removed)
- Separate modal for admin credentials
- Only ADMIN role can access `/admin` routes

### Restrictions
- STUDENT cannot become ADMIN
- Role is determined entirely by backend
- No UI-based role switching to ADMIN
- Admin endpoint returns generic error for non-admin users

---

## Recommendations System

Personalized suggestions based on:
1. **Current Status** - Which criteria are failing
2. **Student Type** - University vs College requirements
3. **Progress** - How close to meeting requirements
4. **Timeline** - Estimated time to complete

### Recommendation Categories
- Ethics (Đạo đức)
- Study (Học tập)
- Physical (Sức khỏe)
- Volunteer (Tình nguyện)
- Integration (Hội nhập)

---

## Event System

### Features
- Month-by-month display
- Past events archived automatically
- Category-based filtering
- Supports events with multiple criteria

### Suggested Event Categories
- `ethics` - Đạo đức, học chủ nghĩa Mác-Lênin
- `study` - Tập trung học tập, NCKH
- `physical` - Thể dục, giải chạy
- `volunteer` - Mùa hè xanh, tình nguyện
- `integration` - Hội nhập quốc tế, ngoại ngữ

---

## Testing & Verification

### Test User Account (Sinh Viên)
```
MSSV: 0123456789
Password: password123
Name: Nguyễn Văn A
Class: CT01
Faculty: Khoa CNTT
Type: University
```

### Test Admin Account
```
MSSV: 9876543210
Password: admin123
Role: ADMIN
```

---

## Deployment Checklist

- [ ] Update JWT_SECRET & ADMIN_SECRET to strong random values
- [ ] Configure MONGODB_URI for production
- [ ] Set NODE_ENV=production
- [ ] Enable CORS for production domain
- [ ] Set up HTTPS/SSL
- [ ] Configure email notifications (optional)
- [ ] Set up monitoring & logging
- [ ] Backup MongoDB regularly
- [ ] Test all auth flows
- [ ] Verify MSSV validation on production

---

## Maintenance

### Regular Tasks
- Archive old events (automated monthly)
- Monitor auth failures
- Review role assignments
- Backup user data
- Check JWT token expirations

### Troubleshooting
```
"MSSV must be exactly 10 digits"
  → Check input validation on both sides

"Invalid or expired token"
  → Clear localStorage, login again

"Insufficient permissions"
  → Verify user role in MongoDB
  → Check JWT secret matches

"Database connection failed"
  → Verify MONGODB_URI
  → Check MongoDB service status
```

---

## Future Enhancements

1. Email notifications for status updates
2. OAuth2 integration (Google, Microsoft)
3. Export to PDF/Excel for admin
4. Mobile app (React Native)
5. Advanced analytics dashboard
6. Automated evidence verification
7. Multi-language support
8. Integration with university ERP system

---

## Support & Contact

For issues or questions, contact the development team.
