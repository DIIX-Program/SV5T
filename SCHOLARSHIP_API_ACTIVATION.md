# 📝 Hướng dẫn kích hoạt Scholarship API

## ⚠️ Quan trọng: File này chỉ để hướng dẫn, KHÔNG cần làm ngay bây giờ

Hiện tại hệ thống đang chạy **LOCAL STORAGE MODE** và hoạt động tốt.  
Chỉ thực hiện các bước này khi bạn muốn chuyển sang **PRODUCTION MODE** (sử dụng MongoDB).

---

## 🎯 Mục đích

Kích hoạt Scholarship API để:
- Lưu trữ học bổng trên MongoDB thay vì localStorage
- Đồng bộ dữ liệu giữa nhiều users
- Có thể deploy lên server thực

---

## 📋 Các file đã chuẩn bị sẵn

✅ **Model**: `server/models/Scholarship.js` - Đã tạo  
✅ **Routes**: `server/routes/scholarshipRoutes.js` - Đã tạo  
✅ **API Service**: `services/api.js` - Đã có scholarshipAPI (đang comment)  
⚠️ **Server Integration**: `server/server.js` - CẦN THÊM route

---

## 🔧 Bước 1: Thêm route vào server.js

**Mở file**: `server/server.js`

**Tìm dòng** (~line 10):
\`\`\`javascript
import eventRoutes from './routes/eventRoutes.js';
\`\`\`

**Thêm sau dòng đó**:
\`\`\`javascript
// 🔄 API INTEGRATION - Uncomment khi cần dùng Scholarship API
// import scholarshipRoutes from './routes/scholarshipRoutes.js';
\`\`\`

**Tìm dòng** (~line 32):
\`\`\`javascript
app.use('/api/events', eventRoutes);
\`\`\`

**Thêm sau dòng đó**:
\`\`\`javascript
// 🔄 API INTEGRATION - Uncomment khi cần dùng Scholarship API
// app.use('/api/scholarships', scholarshipRoutes);
\`\`\`

---

## 🔧 Bước 2: Uncomment scholarshipAPI trong api.js

**File**: `services/api.js`

Đã có sẵn code (line ~86):
\`\`\`javascript
// 🔄 API INTEGRATION - Scholarship API (ready to use)
// Uncomment khi đã tạo backend routes
export const scholarshipAPI = {
  getAll: (params) => apiClient.get(\`/scholarships\`, { params }),
  getById: (id) => apiClient.get(\`/scholarships/\${id}\`),
  create: (data) => apiClient.post(\`/scholarships\`, data),
  update: (id, data) => apiClient.put(\`/scholarships/\${id}\`, data),
  delete: (id) => apiClient.delete(\`/scholarships/\${id}\`),
  getActive: () => apiClient.get(\`/scholarships/status/active\`),
  getExpired: () => apiClient.get(\`/scholarships/status/expired\`)
};
\`\`\`

**Chỉ cần xóa dấu `//` ở đầu mỗi dòng để uncomment**

---

## 🔧 Bước 3: Uncomment code trong AdminView.tsx

**Tìm comment**: `// 🔄 API INTEGRATION`

Có 3 chỗ cần uncomment:

### 3.1. Import API (line ~29)
\`\`\`typescript
// import { scholarshipAPI } from '../services/api';
\`\`\`
→ Xóa `//` ở đầu

### 3.2. Create Scholarship (line ~888)
\`\`\`typescript
// (async () => {
//   try {
//     const response = await scholarshipAPI.create(scholarshipForm);
//     if (response.data.success) {
//       const createdScholarship = response.data.data;
//       setScholarships([...scholarships, createdScholarship]);
//     }
//   } catch (error) {
//     console.error('Error creating scholarship:', error);
//     alert('Lỗi tạo học bổng. Vui lòng thử lại.');
//     return;
//   }
// })();
\`\`\`
→ Uncomment toàn bộ block

### 3.3. Delete Scholarship (line ~931)
\`\`\`typescript
// (async () => {
//   try {
//     await scholarshipAPI.delete(s.id);
//     setScholarships(scholarships.filter(item => item.id !== s.id));
//   } catch (error) {
//     console.error('Error deleting scholarship:', error);
//     alert('Lỗi xóa học bổng. Vui lòng thử lại.');
//   }
// })();
\`\`\`
→ Uncomment toàn bộ block

---

## 🔧 Bước 4: Uncomment fetch scholarships trong App.tsx

**Tìm useEffect fetch initial data** (line ~133):

\`\`\`typescript
// const scholarshipsResponse = await scholarshipAPI.getAll();
// if (scholarshipsResponse.data.success) {
//   setScholarships(scholarshipsResponse.data.data);
// }
\`\`\`
→ Uncomment 3 dòng này

---

## ✅ Bước 5: Testing

### 5.1. Khởi động servers

**Terminal 1 - Backend**:
\`\`\`bash
npm run server:dev
\`\`\`
Kiểm tra console, phải thấy: `Server running on port 5000`

**Terminal 2 - Frontend**:
\`\`\`bash
npm run dev
\`\`\`
Mở trình duyệt: `http://localhost:5173`

### 5.2. Test workflow

1. **Login** với tài khoản Admin:
   - MSSV: `0000000001`
   - Password: `admin123`

2. **Kiểm tra tab Học bổng**:
   - Click tab "Học bổng"
   - Nhấn "Thêm học bổng mới"
   - Điền thông tin:
     - Tên: "Học bổng SV5T Xuất sắc"
     - Nội dung: "Dành cho sinh viên hoàn thành 5 tiêu chí"
     - Ngày hết hạn: Chọn 1 tháng sau
   - Nhấn "Đăng thông báo"

3. **Kiểm tra MongoDB**:
   \`\`\`bash
   mongosh
   use sv5t_database
   db.scholarships.find().pretty()
   \`\`\`
   Phải thấy học bổng vừa tạo

4. **Test đồng bộ**:
   - Refresh trang (F5)
   - Học bổng vẫn còn (load từ database)
   - Mở trình duyệt khác → học bổng vẫn hiển thị

5. **Test xóa**:
   - Click nút xóa học bổng
   - Confirm
   - Kiểm tra MongoDB: `db.scholarships.find().pretty()`
   - Học bổng đã bị xóa

---

## 🐛 Troubleshooting

### Lỗi: "Cannot read property 'create' of undefined"
**Nguyên nhân**: Chưa uncomment import scholarshipAPI  
**Giải pháp**: Kiểm tra lại import trong AdminView.tsx

### Lỗi: "404 Not Found /api/scholarships"
**Nguyên nhân**: Chưa thêm route vào server.js  
**Giải pháp**: Kiểm tra lại Bước 1

### Lỗi: "Scholarship is not defined"
**Nguyên nhân**: server.js chưa import scholarshipRoutes  
**Giải pháp**: Kiểm tra lại import statement

### Data không load sau khi refresh
**Nguyên nhân**: Chưa uncomment fetchInitialData trong App.tsx  
**Giải pháp**: Kiểm tra lại Bước 4

---

## 📊 Kiểm tra database

### Xem tất cả scholarships:
\`\`\`bash
mongosh
use sv5t_database
db.scholarships.find().pretty()
\`\`\`

### Đếm số lượng:
\`\`\`bash
db.scholarships.countDocuments()
\`\`\`

### Xóa tất cả (để test lại):
\`\`\`bash
db.scholarships.deleteMany({})
\`\`\`

### Tìm scholarships active (chưa hết hạn):
\`\`\`javascript
const today = new Date().toISOString().split('T')[0];
db.scholarships.find({ expiryDate: { $gte: today } })
\`\`\`

---

## 🎉 Sau khi hoàn thành

✅ Scholarships được lưu trên MongoDB  
✅ Đồng bộ giữa nhiều users/devices  
✅ Data persistent kể cả khi clear localStorage  
✅ Có thể deploy lên production  

**Lưu ý**: Nếu có dữ liệu học bổng quan trọng trong localStorage cũ, hãy:
1. Export ra file JSON trước khi chuyển
2. Import vào MongoDB sau khi kích hoạt API

---

**Tạo bởi**: GitHub Copilot  
**Ngày**: 28/12/2025  
**File liên quan**:
- `server/models/Scholarship.js`
- `server/routes/scholarshipRoutes.js`
- `services/api.js`
- `views/AdminView.tsx`
- `App.tsx`
