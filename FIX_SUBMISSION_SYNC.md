# 🧪 Test Case: Đồng bộ dữ liệu submissions giữa các tài khoản

## ✅ Vấn đề đã sửa

**Trước đây**: Khi logout, tất cả submissions bị xóa → Admin không thấy hồ sơ từ sinh viên

**Bây giờ**: Submissions được giữ lại khi logout → Admin có thể duyệt hồ sơ từ tất cả sinh viên

## 🔧 Thay đổi code

**File**: `App.tsx` (line ~196)

**Trước**:
\`\`\`typescript
const handleLogout = () => {
  localStorage.removeItem('sv5t_token');
  localStorage.removeItem('sv5t_user');
  setAuthUser(null);
  setProfile(null);
  setCriteria(INITIAL_CRITERIA);
  setSubmissions([]);  // ❌ Xóa hết submissions
  setRole('student');
};
\`\`\`

**Sau**:
\`\`\`typescript
const handleLogout = () => {
  localStorage.removeItem('sv5t_token');
  localStorage.removeItem('sv5t_user');
  setAuthUser(null);
  setProfile(null);
  setCriteria(INITIAL_CRITERIA);
  
  // ⚠️ KHÔNG xóa submissions - đây là dữ liệu global
  // setSubmissions([]); // ❌ Commented out
  
  setRole('student');
};
\`\`\`

---

## 📝 Hướng dẫn test

### Test Case 1: Sinh viên nộp hồ sơ → Admin duyệt

**Bước 1**: Login bằng tài khoản sinh viên
- MSSV: `2024001001`
- Password: `student123`

**Bước 2**: Điền thông tin hồ sơ
- Họ tên: Nguyễn Văn A
- Lớp: CNTT-K17
- Khoa: Công nghệ thông tin
- Đại học/Cao đẳng: Chọn "Đại học"

**Bước 3**: Nộp minh chứng
- Click "NỘP THÀNH TÍCH / MINH CHỨNG MỚI"
- Chọn tiêu chí: Đạo đức (hoặc bất kỳ)
- Nhập mô tả: "Hoàn thành khóa đào tạo Mác-Lênin"
- Chọn ngày: Hôm nay
- Upload file (hoặc bỏ qua)
- Click "Nộp minh chứng"

**Bước 4**: Kiểm tra
- Phải thấy hồ sơ vừa nộp ở trạng thái "Chờ duyệt"
- Icon màu vàng ⏱️

**Bước 5**: Logout
- Click nút Logout (icon 🚪)

**Bước 6**: Login bằng tài khoản Admin
- MSSV: `0000000001`
- Password: `admin123`

**Bước 7**: Kiểm tra tab "Duyệt hồ sơ"
- Click tab "Duyệt hồ sơ"
- ✅ **PHẢI THẤY** hồ sơ của sinh viên vừa nộp
- Thấy thông tin: MSSV, tên sinh viên, tiêu chí, ngày nộp

**Bước 8**: Duyệt hồ sơ
- Click "Duyệt" (nút xanh) hoặc "Từ chối" (nút đỏ)
- Nếu từ chối: Nhập lý do
- Xác nhận

**Bước 9**: Logout admin → Login lại sinh viên
- Logout tài khoản admin
- Login lại bằng MSSV `2024001001`
- ✅ Phải thấy hồ sơ đã được duyệt/từ chối

---

### Test Case 2: Nhiều sinh viên cùng nộp

**Bước 1**: Login sinh viên 1
- MSSV: `2024001001`, password: `student123`
- Nộp hồ sơ với mô tả: "Hồ sơ sinh viên 1"

**Bước 2**: Logout → Login sinh viên 2
- MSSV: `2024001002`, password: `student123`
- Nộp hồ sơ với mô tả: "Hồ sơ sinh viên 2"

**Bước 3**: Logout → Login sinh viên 3
- MSSV: `2024001003`, password: `student123`
- Nộp hồ sơ với mô tả: "Hồ sơ sinh viên 3"

**Bước 4**: Logout → Login Admin
- MSSV: `0000000001`, password: `admin123`
- Click tab "Duyệt hồ sơ"

**Kiểm tra**:
- ✅ Phải thấy **CẢ 3 HỒ SƠ** từ 3 sinh viên khác nhau
- Mỗi hồ sơ hiển thị đúng MSSV và thông tin sinh viên

---

### Test Case 3: Admin switch mode sinh viên

**Bước 1**: Login Admin
- MSSV: `0000000001`, password: `admin123`

**Bước 2**: Switch sang mode sinh viên
- Click nút "Chuyển sang chế độ Sinh viên" (ở góc phải trên)

**Bước 3**: Điền hồ sơ với quyền admin
- Điền thông tin: Họ tên, Lớp, Khoa
- Nộp minh chứng: "Hồ sơ từ admin mode"

**Bước 4**: Switch lại mode admin
- Click "Chuyển sang chế độ Admin"
- Vào tab "Duyệt hồ sơ"

**Kiểm tra**:
- ✅ Phải thấy hồ sơ vừa nộp từ admin mode
- ✅ Tất cả hồ sơ từ test trước vẫn còn

---

## 🔍 Kiểm tra localStorage

Mở Console trong trình duyệt (F12), chạy lệnh sau:

\`\`\`javascript
// Xem tất cả submissions
JSON.parse(localStorage.getItem('sv5t_submissions'))

// Đếm số lượng submissions
JSON.parse(localStorage.getItem('sv5t_submissions')).length

// Xem user hiện tại
JSON.parse(localStorage.getItem('sv5t_user'))
\`\`\`

**Kết quả mong đợi**:
- Submissions **KHÔNG bị clear** khi logout
- Mỗi submission có `userId` tương ứng với người nộp

---

## ⚠️ Lưu ý

### 1. localStorage scope
- localStorage được **share global** trên cùng 1 domain
- Tất cả users trên cùng trình duyệt **chia sẻ chung** localStorage
- Đây là lý do admin có thể thấy hồ sơ của sinh viên

### 2. Khi nào dữ liệu bị mất?
Submissions chỉ bị mất khi:
- Clear localStorage thủ công (F12 → Application → Clear storage)
- Clear browser data
- Chạy `localStorage.clear()` trong code

### 3. Production mode
Khi chuyển sang MongoDB:
- Mỗi user có dữ liệu riêng trên database
- Admin fetch tất cả submissions qua API
- Không còn vấn đề về đồng bộ localStorage

---

## ✅ Checklist test hoàn chỉnh

- [ ] Sinh viên nộp hồ sơ → Logout → Admin login → Thấy hồ sơ trong tab duyệt
- [ ] 3 sinh viên nộp hồ sơ → Admin thấy cả 3 hồ sơ
- [ ] Admin duyệt hồ sơ → Sinh viên login lại → Thấy trạng thái cập nhật
- [ ] Admin switch mode sinh viên → Nộp hồ sơ → Switch lại admin → Thấy hồ sơ
- [ ] Refresh trang → Tất cả hồ sơ vẫn còn (load từ localStorage)
- [ ] localStorage.getItem('sv5t_submissions') có đúng dữ liệu
- [ ] Logout không làm mất submissions

---

## 🐛 Nếu vẫn có vấn đề

### Vấn đề: Sau logout vẫn không thấy hồ sơ

**Nguyên nhân**: Cache cũ của localStorage

**Giải pháp**:
1. Mở Console (F12)
2. Chạy: `localStorage.clear()`
3. Reload trang (F5)
4. Test lại từ đầu

### Vấn đề: Hồ sơ bị duplicate

**Nguyên nhân**: Nộp nhiều lần

**Giải pháp**: Mở Console, chạy:
\`\`\`javascript
let submissions = JSON.parse(localStorage.getItem('sv5t_submissions'));
// Xóa duplicates theo ID
submissions = [...new Map(submissions.map(s => [s.id, s])).values()];
localStorage.setItem('sv5t_submissions', JSON.stringify(submissions));
location.reload();
\`\`\`

---

**Cập nhật**: 28/12/2025  
**Status**: Fixed ✅  
**Next**: Test thoroughly theo checklist
