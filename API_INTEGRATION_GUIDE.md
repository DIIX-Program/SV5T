# 🔄 Hướng dẫn chuyển đổi từ localStorage sang API/MongoDB

## 📋 Tổng quan

Hiện tại dự án đang chạy **LOCAL STORAGE MODE** - tất cả dữ liệu được lưu trên trình duyệt (localStorage).

Code để tích hợp với API/MongoDB đã được chuẩn bị sẵn nhưng **đang được comment lại**.

## 🎯 Khi nào nên chuyển sang Production Mode?

- Khi cần nhiều người dùng cùng truy cập dữ liệu
- Khi cần backup và bảo mật dữ liệu
- Khi muốn deploy lên server thực tế
- Khi cần đồng bộ dữ liệu giữa các thiết bị

## ⚙️ Các bước chuyển đổi

### Bước 1: Tạo các API endpoint còn thiếu

Hiện tại các API đã có:
- ✅ `authAPI` - Authentication (đã hoạt động)
- ✅ `studentAPI` - Student management (đã hoạt động)
- ✅ `eventAPI` - Events management (đã có code)

Cần tạo thêm:
- ❌ `scholarshipAPI` - Scholarships management
- ❌ `confessionAPI` - Confessions management

**Tạo file** `server/routes/scholarshipRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Model Scholarship (cần tạo trong server/models/Scholarship.js)
const Scholarship = require('../models/Scholarship');

// GET all scholarships
router.get('/', async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });
    res.json({ success: true, data: scholarships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create scholarship (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const scholarship = new Scholarship(req.body);
    await scholarship.save();
    res.json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE scholarship
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

**Tạo file** `server/models/Scholarship.js`:

```javascript
const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  expiryDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
```

**Thêm route vào** `server/server.js`:

```javascript
const scholarshipRoutes = require('./routes/scholarshipRoutes');
app.use('/api/scholarships', scholarshipRoutes);
```

**Tạo API service** trong `services/api.js`:

```javascript
export const scholarshipAPI = {
  getAll: () => api.get('/scholarships'),
  create: (data: any) => api.post('/scholarships', data),
  delete: (id: string) => api.delete(`/scholarships/${id}`)
};
```

### Bước 2: Uncomment code API trong App.tsx

Tìm các comment có ký hiệu: `// 🔄 API INTEGRATION`

**Trong App.tsx** (dòng ~3):
```typescript
// Uncomment dòng này:
import { studentAPI, eventAPI } from './services/api';
```

**Trong App.tsx** (dòng ~110):
```typescript
// Uncomment toàn bộ useEffect này để fetch data từ API
useEffect(() => {
  const fetchInitialData = async () => {
    if (!authUser) return;
    try {
      // Fetch events from API
      const eventsResponse = await eventAPI.getAll();
      if (eventsResponse.data.success) {
        setEvents(eventsResponse.data.data);
      }
      
      // Fetch scholarships from API
      // const scholarshipsResponse = await scholarshipAPI.getAll();
      // if (scholarshipsResponse.data.success) {
      //   setScholarships(scholarshipsResponse.data.data);
      // }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };
  fetchInitialData();
}, [authUser]);
```

**Trong App.tsx** sync localStorage (dòng ~140):
```typescript
// Uncomment để sync events lên database
if (events.length > 0) {
  events.forEach(async (event) => {
    try {
      if (!event.id.startsWith('local_')) {
        await eventAPI.create(event);
      }
    } catch (error) {
      console.error('Error syncing event:', error);
    }
  });
}
```

### Bước 3: Uncomment code API trong AdminView.tsx

**Trong AdminView.tsx** (dòng ~29):
```typescript
// Uncomment các import này:
import { eventAPI } from '../services/api';
import { scholarshipAPI } from '../services/api';
```

**Trong function handleAddEvent** (dòng ~149):
```typescript
// Khi UPDATE event - uncomment:
try {
  await eventAPI.update(editingEventId, eventForm);
  setEvents(events.map(e =>
    e.id === editingEventId
      ? { ...e, ...eventForm }
      : e
  ));
} catch (error) {
  console.error('Error updating event:', error);
  alert('Lỗi cập nhật sự kiện. Vui lòng thử lại.');
  return;
}

// Khi CREATE event - uncomment:
try {
  const response = await eventAPI.create(eventForm);
  if (response.data.success) {
    const createdEvent = response.data.data;
    setEvents([...events, createdEvent]);
  }
} catch (error) {
  console.error('Error creating event:', error);
  alert('Lỗi tạo sự kiện. Vui lòng thử lại.');
  return;
}
```

**Trong scholarship creation** (dòng ~873):
```typescript
// Uncomment để save scholarship qua API:
(async () => {
  try {
    const response = await scholarshipAPI.create(scholarshipForm);
    if (response.data.success) {
      const createdScholarship = response.data.data;
      setScholarships([...scholarships, createdScholarship]);
    }
  } catch (error) {
    console.error('Error creating scholarship:', error);
    alert('Lỗi tạo học bổng. Vui lòng thử lại.');
    return;
  }
})();
```

**Trong scholarship deletion** (dòng ~924):
```typescript
// Uncomment để xóa qua API:
(async () => {
  try {
    await scholarshipAPI.delete(s.id);
    setScholarships(scholarships.filter(item => item.id !== s.id));
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    alert('Lỗi xóa học bổng. Vui lòng thử lại.');
  }
})();
```

### Bước 4: Comment hoặc xóa localStorage code

**Sau khi API hoạt động ổn định**, bạn có thể:

1. **Giữ localStorage như backup**: Vẫn sync xuống localStorage song song
2. **Xóa hoàn toàn**: Chỉ dùng database, không dùng localStorage

Tùy vào yêu cầu dự án.

### Bước 5: Testing

1. **Khởi động MongoDB**:
   ```bash
   # Đảm bảo MongoDB đang chạy
   mongod
   ```

2. **Khởi động Backend**:
   ```bash
   npm run server:dev
   ```

3. **Khởi động Frontend**:
   ```bash
   npm run dev
   ```

4. **Test các chức năng**:
   - ✅ Đăng nhập với tài khoản seed (MSSV: 2024001001, password: student123)
   - ✅ Tạo sự kiện mới (Admin)
   - ✅ Tạo học bổng mới (Admin)
   - ✅ Refresh trang - kiểm tra data có load từ database không
   - ✅ Mở trình duyệt khác - kiểm tra data đồng bộ

## 🔍 Kiểm tra dữ liệu trong MongoDB

```bash
# Mở MongoDB shell
mongosh

# Chọn database
use sv5t_database

# Xem danh sách users
db.users.find().pretty()

# Xem danh sách events
db.events.find().pretty()

# Xem danh sách scholarships
db.scholarships.find().pretty()

# Đếm số lượng
db.users.countDocuments()
db.events.countDocuments()
```

## ⚠️ Lưu ý quan trọng

1. **Backup dữ liệu localStorage trước**:
   - Mở Console trong trình duyệt
   - Copy toàn bộ dữ liệu localStorage
   ```javascript
   JSON.stringify(localStorage)
   ```

2. **Migration data từ localStorage sang MongoDB**:
   - Nếu có dữ liệu quan trọng trong localStorage
   - Viết script để import vào database
   - Hoặc nhập thủ công

3. **Authentication**:
   - API endpoints cần xác thực sẽ yêu cầu JWT token
   - Token được lưu trong localStorage sau khi login
   - Middleware `authenticateToken` sẽ validate

4. **Error Handling**:
   - Luôn có try-catch cho API calls
   - Hiển thị thông báo lỗi rõ ràng cho user
   - Log errors để debug

## 📝 Checklist chuyển đổi

- [ ] Tạo Scholarship Model và Routes
- [ ] Tạo Confession Model và Routes (nếu cần)
- [ ] Uncomment API imports trong App.tsx
- [ ] Uncomment API imports trong AdminView.tsx
- [ ] Uncomment fetchInitialData useEffect
- [ ] Uncomment event API calls
- [ ] Uncomment scholarship API calls
- [ ] Test đăng nhập
- [ ] Test tạo event
- [ ] Test tạo scholarship
- [ ] Test xóa scholarship
- [ ] Test refresh page (data có load không)
- [ ] Test đồng bộ giữa nhiều trình duyệt
- [ ] Backup dữ liệu localStorage cũ
- [ ] Migration data (nếu cần)

## 🚀 Sau khi hoàn thành

Dự án sẽ:
- ✅ Lưu trữ dữ liệu trên MongoDB
- ✅ Đồng bộ giữa nhiều users
- ✅ Có thể deploy lên server
- ✅ Bảo mật với JWT authentication
- ✅ Dữ liệu persistent và có backup

---

**Tạo bởi**: GitHub Copilot  
**Ngày**: 28/12/2025  
**Mục đích**: Hướng dẫn chuyển đổi từ localhost mode sang production mode
