# Quick Reference - Quản Lý Sinh Viên 5 Tốt

## 🚀 Quick Start (3 Steps)

```bash
# 1. Install
npm install && npm install jsonwebtoken

# 2. Setup .env
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/sv5t
JWT_SECRET=dev-secret
ADMIN_SECRET=dev-admin-secret
REACT_APP_API_URL=http://localhost:5000/api" > .env

# 3. Run (3 terminals)
mongod                    # Terminal 1
npm run server:dev        # Terminal 2
npm run dev              # Terminal 3
```

---

## 📁 File Structure

```
d:\Project\SV5T_bydiix\
│
├── server/
│   ├── controllers/
│   │   ├── authController.js ✅ NEW
│   │   ├── eventController.js ✅ NEW
│   │   └── ...
│   ├── middleware/
│   │   └── authMiddleware.js ✅ NEW
│   ├── models/
│   │   ├── User.js ✅ NEW
│   │   ├── Event.js ✅ NEW
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js ✅ NEW
│   │   ├── eventRoutes.js ✅ NEW
│   │   └── ...
│   └── server.js ✅ UPDATED
│
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx ✅ NEW
│   │   └── ...
│   ├── views/
│   │   ├── StudentView.tsx ✅ UPDATED
│   │   └── ...
│   ├── services/
│   │   ├── api.js ✅ UPDATED
│   │   ├── recommendationService.ts ✅ NEW
│   │   └── ...
│   ├── types.ts ✅ UPDATED
│   └── App.tsx ⏳ NEEDS WORK
│
├── .env ✅ CREATE
├── package.json ✅ UPDATED
│
├── SYSTEM_SETUP.md ✅ NEW (Comprehensive)
├── IMPLEMENTATION_GUIDE.md ✅ NEW (Step-by-step)
├── PROJECT_SUMMARY.md ✅ NEW (Overview)
└── README.md (Original)
```

---

## 🔑 Key Implementations

### 1. User Registration
```
Frontend: /components/LandingPage + App Modal
          → Input: MSSV (10 digits), Password, Profile
          → Validate: MSSV format
          
Backend:  POST /api/auth/register
          → Validate MSSV regex
          → Hash password (bcryptjs)
          → Create user in MongoDB
          → Return JWT token
          
Database: User { mssv(unique), passwordHash, role:STUDENT, profile }
```

### 2. User Login
```
Frontend: Modal input MSSV + password
          → Validate format
          → POST /api/auth/login
          
Backend:  → Find user by MSSV
          → Verify password
          → Generate JWT
          → Return user + token
          
Frontend: Store token in localStorage
          → Redirect to StudentView
```

### 3. Admin Access
```
Frontend: Hidden button (bottom-right)
          → AdminLoginModal
          → POST /api/admin/login
          
Backend:  → Check role === ADMIN (only)
          → Verify password
          → Return admin JWT
          
Frontend: Switch to AdminView
          → Full management panel
```

### 4. Events by Month
```
Database: Event { date, month(1-12), year, isArchived }
          
API:      GET /api/events/month/:month/:year
          → Filter by month & year
          → Return sorted events
          
GET /api/events/archive
          → Return past events
          → Paginated results
          
Auto:     archivePastEvents() → Run monthly
          → Mark date < now as archived
```

### 5. MSSV Validation
```
Frontend: const isValidMSSV = (m) => /^\d{10}$/.test(m)
          ✅ Input: Only digits, max 10
          ✅ Display: Real-time feedback
          
Backend:  mongoose schema: match: /^\d{10}$/
          ✅ Unique constraint
          ✅ Validate on create/update
          
Result:   Prevents invalid MSSV everywhere
```

---

## 🔗 Critical Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/auth/register | POST | ❌ | Student register |
| /api/auth/login | POST | ❌ | Student login |
| /api/auth/admin/login | POST | ❌ | Admin login (HIDDEN) |
| /api/auth/me | GET | ✅ | Get current user |
| /api/events/all | GET | ❌ | Get events |
| /api/events/month/:m/:y | GET | ❌ | Events by month |
| /api/events/archive | GET | ❌ | Past events |
| /api/events | POST | ✅🔐 | Create (admin) |
| /api/events/:id | PUT | ✅🔐 | Update (admin) |
| /api/events/:id | DELETE | ✅🔐 | Delete (admin) |

Legend: ❌=Public, ✅=Authenticated, 🔐=Admin only

---

## 💾 Database Schema (Quick)

### User Collection
```javascript
{
  mssv: "0123456789",           // Unique, 10 digits
  passwordHash: "bcrypt_hash",  // Never plain text
  role: "STUDENT" | "ADMIN",    // Enum
  profile: {
    name: "Nguyễn Văn A",
    className: "CT01",
    faculty: "Khoa CNTT",
    studentType: "UNIVERSITY" | "COLLEGE"
  },
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Collection
```javascript
{
  title: "Hội thảo CNKT",
  description: "...",
  date: Date,
  month: 12,                    // 1-12, indexed
  year: 2025,                   // indexed
  categories: ["ethics", "study"],
  location: "Hội trường A",
  capacity: 500,
  link: "https://...",
  status: "upcoming" | "ongoing" | "completed" | "cancelled",
  isArchived: false,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🛡️ Security Checklist

- ✅ Password: bcryptjs (10 rounds)
- ✅ Token: JWT (7-day expiry)
- ✅ MSSV: Unique constraint + regex
- ✅ Admin: Role check before access
- ✅ Errors: Generic messages (no info leak)
- ✅ Validation: Both frontend & backend
- ✅ Secrets: Use environment variables

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "MSSV invalid" | Format wrong | Check /^\d{10}$/ |
| "Token expired" | 7 days passed | Logout, login again |
| "Permission denied" | Not admin | Check user.role in DB |
| "DB connection failed" | MongoDB down | Start mongod |
| CORS error | Wrong origin | Add to cors config |
| Blank page | API not running | npm run server:dev |

---

## 📊 System Features Matrix

| Feature | Frontend | Backend | Database |
|---------|----------|---------|----------|
| Student Auth | ✅ Modal | ✅ Routes | ✅ Users |
| Admin Auth | ✅ Modal | ✅ Hidden | ✅ Check |
| MSSV Valid | ✅ Input | ✅ Regex | ✅ Index |
| Landing Page | ✅ NEW | - | - |
| Events by Month | ⏳ View | ✅ API | ✅ Index |
| Recommendations | ⏳ Display | ✅ Service | - |
| Profile Complete | ✅ Form | ⏳ API | ⏳ Save |
| Evidence Upload | ⏳ Auth | ⏳ API | ⏳ Store |
| Admin Dashboard | ⏳ View | ⏳ APIs | - |

Legend: ✅=Done, ⏳=In Progress, -=Not needed

---

## 🎯 Priority Completion Order

1. **Complete App.tsx** (highest impact)
   - Auth modals + handlers
   - Token management
   - Page routing

2. **Test backend APIs**
   - Register/login endpoints
   - Admin login
   - Event CRUD

3. **Implement AdminView**
   - Student management
   - Evidence review
   - Analytics

4. **Polish & Deploy**
   - Error handling
   - Loading states
   - Responsive design
   - Environment setup

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| SYSTEM_SETUP.md | Comprehensive setup & architecture |
| IMPLEMENTATION_GUIDE.md | Step-by-step completion |
| PROJECT_SUMMARY.md | Full system overview |
| THIS FILE | Quick reference |

---

## 🔐 Test Accounts

**Student:**
- MSSV: `0123456789`
- Password: `password123`

**Admin:**
- MSSV: `9876543210`
- Password: `admin123`

---

## 💡 Tips for Development

1. **Use Postman** for API testing
2. **MongoDB Compass** for data inspection
3. **React DevTools** for state debugging
4. **Console.log** auth responses
5. **Test validation** on both sides
6. **Check role** before admin operations
7. **Clear localStorage** if auth issues
8. **Read error messages** carefully

---

## 🚀 Deploy Checklist

Before production:
- [ ] Change JWT_SECRET & ADMIN_SECRET
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for real domain
- [ ] Setup MongoDB backups
- [ ] Enable logging/monitoring
- [ ] Test all auth flows
- [ ] Verify MSSV validation
- [ ] Load test with many users
- [ ] Setup email notifications (optional)

---

## 📞 Quick Help

```
Q: How to reset a password?
A: Currently no reset - create new account

Q: How to change user role?
A: MongoDB: db.users.updateOne({mssv: "..."}, {$set: {role: "ADMIN"}})

Q: Archive old events?
A: POST /api/events/archive/batch (admin)

Q: Where is JWT secret?
A: In .env file (JWT_SECRET)

Q: How to test admin?
A: Use /api/admin/login endpoint (HIDDEN)
```

---

**Last Updated**: December 27, 2025
**Status**: Ready for Frontend Implementation
**Est. Time to Complete**: 6-10 hours

Good luck! 🎉
