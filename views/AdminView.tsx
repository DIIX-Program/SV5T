import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { EvidenceSubmission, EvidenceStatus, UniversityEvent, EvaluationStatus, User, Scholarship } from '../types';
import bcrypt from 'bcryptjs';
import {
  Users,
  FileCheck,
  CalendarPlus,
  Search,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Eye,
  Trash2,
  PieChart,
  Sparkles,
  ArrowRight,
  Settings,
  GraduationCap
} from 'lucide-react';
import { CATEGORY_LABELS } from '../constants';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { studentAPI } from '../services/api';

// 🔄 API INTEGRATION - Uncomment khi chuyển sang production
// import { eventAPI } from '../services/api';
// import { scholarshipAPI } from '../services/api'; // Cần tạo API này

interface Props {
  submissions: EvidenceSubmission[];
  setSubmissions: (s: EvidenceSubmission[]) => void;
  events: UniversityEvent[];
  setEvents: (e: UniversityEvent[]) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  currentUser: User | null;
  scholarships?: Scholarship[];
  setScholarships?: (s: Scholarship[]) => void;
}

const AdminView: React.FC<Props> = ({ submissions, setSubmissions, events, setEvents, users, setUsers, currentUser, scholarships, setScholarships }) => {
  const [tab, setTab] = useState<'dashboard' | 'approvals' | 'events' | 'students' | 'settings' | 'scholarships'>('dashboard');

  // Scholarship management
  const [showScholarshipForm, setShowScholarshipForm] = useState(false);
  const [scholarshipForm, setScholarshipForm] = useState({
    name: '',
    content: '',
    expiryDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Students data from API
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch students when tab changes to students
  useEffect(() => {
    if (tab === 'students') {
      fetchStudents();
    }
  }, [tab]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await studentAPI.getAll();
      if (response.data.success) {
        setStudents(response.data.data);
      } else {
        console.error('API returned error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Không thể tải dữ liệu sinh viên. Vui lòng kiểm tra kết nối server.');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Event management
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    description: '',
    categories: [] as string[],
    location: '',
    link: ''
  });

  // Student filters
  const [studentFilters, setStudentFilters] = useState({
    faculty: '',
    status: '',
    academicYear: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = {
    totalSubmissions: submissions.length,
    pending: submissions.filter(e => e.status === EvidenceStatus.PENDING).length,
    approved: submissions.filter(e => e.status === EvidenceStatus.APPROVED).length,
    rejected: submissions.filter(e => e.status === EvidenceStatus.REJECTED).length,
  };

  const handleAction = (id: string, status: EvidenceStatus) => {
    let comment = "";
    if (status === EvidenceStatus.REJECTED) {
      comment = prompt("Nhập lý do từ chối (Vui lòng ghi rõ thiếu minh chứng gì):") || "";
      if (!comment) return;
    }
    setSubmissions(submissions.map(s => s.id === id ? { ...s, status, adminComment: comment || s.adminComment } : s));
  };

  const handleChangePassword = () => {
    if (!currentUser) return;
    if (!bcrypt.compareSync(currentPassword, currentUser.passwordHash)) {
      setPasswordError('Mật khẩu hiện tại không đúng');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    const updatedUsers = users.map(u =>
      u.id === currentUser.id
        ? { ...u, passwordHash: bcrypt.hashSync(newPassword, 10) }
        : u
    );
    setUsers(updatedUsers);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    alert('Mật khẩu đã được cập nhật thành công!');
  };

  // Event handlers
  const handleAddEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.description || !eventForm.location || eventForm.categories.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin sự kiện');
      return;
    }

    if (editingEventId) {
      // 💾 LOCAL STORAGE MODE - Hiện tại dùng localStorage
      setEvents(events.map(e =>
        e.id === editingEventId
          ? { ...e, ...eventForm }
          : e
      ));
      
      // 🔄 API INTEGRATION - Uncomment để update event qua API
      // try {
      //   await eventAPI.update(editingEventId, eventForm);
      //   setEvents(events.map(e =>
      //     e.id === editingEventId
      //       ? { ...e, ...eventForm }
      //       : e
      //   ));
      // } catch (error) {
      //   console.error('Error updating event:', error);
      //   alert('Lỗi cập nhật sự kiện. Vui lòng thử lại.');
      //   return;
      // }
      
      setEditingEventId(null);
    } else {
      // 💾 LOCAL STORAGE MODE - Hiện tại dùng localStorage
      const newEvent: UniversityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        ...eventForm,
        link: eventForm.link || undefined
      };
      setEvents([...events, newEvent]);
      
      // 🔄 API INTEGRATION - Uncomment để lưu event qua API
      // try {
      //   const response = await eventAPI.create(eventForm);
      //   if (response.data.success) {
      //     const createdEvent = response.data.data;
      //     setEvents([...events, createdEvent]);
      //   }
      // } catch (error) {
      //   console.error('Error creating event:', error);
      //   alert('Lỗi tạo sự kiện. Vui lòng thử lại.');
      //   return;
      // }
    }

    setEventForm({
      title: '',
      date: '',
      description: '',
      categories: [],
      location: '',
      link: ''
    });
    setShowEventForm(false);
    alert('Sự kiện đã được ' + (editingEventId ? 'cập nhật' : 'tạo') + ' thành công!');
  };

  const handleEditEvent = (event: UniversityEvent) => {
    setEventForm({
      title: event.title,
      date: event.date,
      description: event.description,
      categories: event.categories,
      location: event.location,
      link: event.link || ''
    });
    setEditingEventId(event.id);
    setShowEventForm(true);
  };

  const toggleCategory = (category: string) => {
    setEventForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Filter and search submissions
  const filteredSubmissions = submissions.filter(s =>
    searchTerm === '' ||
    s.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter and paginate students - using API data
  const studentList = students.map((student: any) => ({
    id: student._id,
    mssv: student.mssv,
    name: student.fullName,
    faculty: student.faculty,
    status: 'Đủ điều kiện',
    gpa: student.gpa || 0,
    completionPercent: 100
  }));

  const filteredStudents = studentList.filter(s => {
    if (studentFilters.faculty && s.faculty !== studentFilters.faculty) return false;
    if (studentFilters.status && s.status !== studentFilters.status) return false;
    return true;
  });

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Export to Excel using ExcelJS
  const getStudentsForExport = async () => {
    if (studentList.length > 0) return studentList;
    try {
      const response = await studentAPI.getAll();
      if (response.data?.success) {
        const apiStudents = response.data.data || [];
        return apiStudents.map((student: any) => ({
          id: student._id,
          mssv: student.mssv,
          name: student.fullName,
          faculty: student.faculty,
          status: 'Đủ điều kiện',
          gpa: student.gpa || 0,
          completionPercent: 100
        }));
      }
      return [];
    } catch (e) {
      console.error('Lỗi tải dữ liệu sinh viên để xuất:', e);
      return [];
    }
  };

  const exportToExcel = async () => {
    try {
      const data = await getStudentsForExport();
      if (data.length === 0) {
        alert('Không có dữ liệu để xuất');
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh sách sinh viên');

      const headerRow = worksheet.addRow(['MSSV', 'Tên sinh viên', 'Khoa', 'GPA', 'Tiến độ (%)', 'Trạng thái']);

      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      data.forEach(s => {
        worksheet.addRow([s.mssv, s.name, s.faculty, s.gpa, s.completionPercent, s.status]);
      });

      worksheet.columns = [
        { width: 15 },
        { width: 25 },
        { width: 25 },
        { width: 10 },
        { width: 15 },
        { width: 15 }
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `DANH_SACH_SINH_VIEN_SV5T_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;

      saveAs(blob, fileName);
      alert('✅ File Excel đã được xuất thành công!');
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      alert('⚠️ Lỗi khi xuất file Excel');
    }
  };

  // Export AI analysis report (PDF) using jsPDF (English-only)
  const exportAIReport = async () => {
    try {
      const data = await getStudentsForExport();
      const facultyCounts: Record<string, number> = {};
      data.forEach((s: any) => {
        if (!s.faculty) return;
        facultyCounts[s.faculty] = (facultyCounts[s.faculty] || 0) + 1;
      });

      const totalStudents = data.length;
      const { totalSubmissions, pending, approved, rejected } = stats;

      const doc = new jsPDF();
      const lines: string[] = [];

      lines.push('SV5T ANALYSIS REPORT');
      lines.push(`Date: ${new Date().toLocaleString('en-US')}`);
      lines.push('');
      lines.push('I. System Overview');
      lines.push(`- Total evidence submissions: ${totalSubmissions}`);
      lines.push(`- Pending: ${pending}`);
      lines.push(`- Approved: ${approved}`);
      lines.push(`- Rejected / Needs revision: ${rejected}`);
      lines.push('');
      lines.push('II. Student Data (summary)');
      lines.push(`- Total students: ${totalStudents}`);
      if (Object.keys(facultyCounts).length > 0) {
        lines.push('- Faculty distribution:');
        Object.entries(facultyCounts).forEach(([faculty, count]) => {
          lines.push(`  • ${faculty}: ${count}`);
        });
      }
      lines.push('');
      lines.push('III. Recommended next actions');
      lines.push('- Prioritize pending approvals to reduce backlog.');
      lines.push('- Add skills workshops for faculties with higher volume.');
      lines.push('- Remind students to supply missing evidence promptly.');

      doc.setFontSize(12);
      let y = 16;
      lines.forEach((line, index) => {
        if (index === 0) {
          doc.setFontSize(16);
          doc.text(line, 14, y);
          doc.setFontSize(12);
          y += 8;
          return;
        }
        doc.text(line, 14, y);
        y += 6;
      });

      const fileName = `SV5T_ANALYSIS_REPORT_${new Date().toISOString().slice(0,10)}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('⚠️ Unable to export analysis report.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] md:overflow-hidden">
      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Thống kê' },
            { id: 'students', icon: Users, label: 'Sinh viên' },
            { id: 'approvals', icon: FileCheck, label: 'Duyệt (' + stats.pending + ')' },
            { id: 'scholarships', icon: GraduationCap, label: 'Học bổng' },
            { id: 'events', icon: CalendarPlus, label: 'Sự kiện' },
            { id: 'settings', icon: Settings, label: 'Cài đặt' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${tab === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600'
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
        <button
          onClick={exportToExcel}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase mt-3 hover:bg-emerald-700 transition-all"
        >
          <Download size={16} /> Xuất Báo cáo Excel
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 space-y-2 hidden md:flex flex-col overflow-y-auto">
        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <PieChart size={12} /> Bảng điều khiển
          </p>
          <div className="space-y-1.5">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Thống kê tổng quan' },
              { id: 'students', icon: Users, label: 'Hồ sơ Sinh viên' },
              { id: 'approvals', icon: FileCheck, label: 'Duyệt hồ sơ (' + stats.pending + ')' },
              { id: 'scholarships', icon: GraduationCap, label: 'Quản lý Học bổng' },
              { id: 'events', icon: CalendarPlus, label: 'Quản lý sự kiện' },
              { id: 'settings', icon: Settings, label: 'Cài đặt' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border ${tab === item.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100'
                  : 'text-slate-500 border-transparent hover:bg-slate-50'
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3 pt-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Hệ thống xét duyệt</p>
            <p className="text-[10px] text-slate-600 leading-relaxed italic">Dữ liệu được bảo mật và backup hàng ngày vào 0h:00.</p>
          </div>
          <button
            onClick={exportToExcel}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <Download size={16} /> Xuất Báo cáo Excel
          </button>
        </div>
      </aside>

      <main className="flex-1 md:overflow-y-auto bg-slate-50/30 p-4 md:p-10">
        {tab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hệ thống Quản trị</h2>
                <p className="text-slate-500 font-medium mt-1 text-sm">Nền tảng xét duyệt Sinh viên 5 Tốt cấp Trường.</p>
              </div>
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Trực tuyến</p>
              </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Chờ xử lý', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
                { label: 'Đã chấp thuận', value: stats.approved, color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
                { label: 'Từ chối/Y/C sửa', value: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-100', icon: XCircle },
                { label: 'Tổng số hồ sơ', value: stats.totalSubmissions, color: 'text-blue-600', bg: 'bg-blue-100', icon: FileCheck },
              ].map((card, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                  <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                    <card.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{card.label}</p>
                    <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight text-base">Mức độ sẵn sàng theo Khoa/Viện</h3>
                  <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">Xem chi tiết</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { name: 'Công nghệ Thông tin', percent: 88, color: 'bg-blue-500', count: 450 },
                    { name: 'Kinh tế - Quản trị', percent: 64, color: 'bg-amber-500', count: 320 },
                    { name: 'Cơ khí - Kỹ thuật', percent: 42, color: 'bg-rose-500', count: 180 },
                    { name: 'Ngôn ngữ & Văn hóa', percent: 76, color: 'bg-emerald-500', count: 210 },
                    { name: 'Khoa học ứng dụng', percent: 55, color: 'bg-indigo-500', count: 125 },
                    { name: 'Du lịch - Nhà hàng', percent: 38, color: 'bg-orange-500', count: 90 },
                  ].map((khoa, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800 leading-tight">{khoa.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{khoa.count} sinh viên</p>
                        </div>
                        <span className="text-xs font-black text-slate-900">{khoa.percent}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${khoa.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${khoa.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-900 p-6 rounded-2xl text-white shadow-2xl shadow-blue-900/10">
                <h3 className="font-black text-base uppercase tracking-tight mb-4 text-blue-400 flex items-center gap-2">
                  <Sparkles size={20} /> Phân tích AI
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <p className="text-[9px] font-black text-blue-400 uppercase mb-1 tracking-widest">Tiêu chí thiếu nhiều nhất</p>
                    <p className="text-sm font-bold leading-tight">Hội nhập tốt</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed italic">Chiếm 68% hồ sơ chưa đạt. Đề xuất tổ chức thêm đợt thi chứng chỉ kỹ năng số.</p>
                  </div>
                  <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <p className="text-[9px] font-black text-amber-400 uppercase mb-1 tracking-widest">Hành động ưu tiên</p>
                    <p className="text-sm font-bold leading-tight">Duyệt minh chứng</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed italic">Còn {stats.pending} hồ sơ mới nộp trong 24h qua. Cần xử lý để ổn định tâm lý SV.</p>
                  </div>
                  <button onClick={exportAIReport} className="w-full py-4 border border-slate-700 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-2">
                    XUẤT BÁO CÁO PHÂN TÍCH <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'approvals' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
            <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Duyệt hồ sơ minh chứng</h2>
                <p className="text-slate-500 font-medium">Hàng đợi xét duyệt các thành tích sinh viên đã cập nhật.</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    placeholder="Tìm MSSV, tên thành tích..."
                    className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none text-sm w-full sm:w-80 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 transition-all">
                  <Filter size={20} />
                </button>
              </div>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20">
              {/* Mobile list */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic">
                    <FileCheck size={48} className="mx-auto text-slate-100 mb-4 opacity-40" />
                    <p className="text-sm font-medium">Hiện không có hồ sơ nào trong hàng đợi.</p>
                  </div>
                ) : (
                  filteredSubmissions.map((s) => (
                    <div key={s.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-slate-800 text-sm">#{s.userId.toUpperCase().slice(0, 8)}</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Nộp: {s.submittedAt}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.criteriaKeys.map(ck => (
                          <span key={ck} className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-tight border border-blue-100/50">
                            {CATEGORY_LABELS[ck as keyof typeof CATEGORY_LABELS]}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-slate-700 leading-snug">{s.description}</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-700 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Eye size={12} /> Xem {s.files.length} tệp
                      </button>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${s.status === EvidenceStatus.APPROVED ? 'bg-green-50 text-green-600 border-green-100' :
                          s.status === EvidenceStatus.REJECTED ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {s.status === EvidenceStatus.PENDING ? 'Chờ duyệt' : (s.status === EvidenceStatus.APPROVED ? 'Hợp lệ' : 'Từ chối')}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(s.id, EvidenceStatus.APPROVED)}
                            disabled={s.status === EvidenceStatus.APPROVED}
                            className="p-2 text-green-600 bg-green-50/50 hover:bg-green-100 rounded-xl transition-all disabled:opacity-20 border border-green-100/30"
                            title="Xác nhận Hợp lệ"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleAction(s.id, EvidenceStatus.REJECTED)}
                            disabled={s.status === EvidenceStatus.REJECTED}
                            className="p-2 text-rose-600 bg-rose-50/50 hover:bg-rose-100 rounded-xl transition-all disabled:opacity-20 border border-rose-100/30"
                            title="Yêu cầu Bổ sung/Từ chối"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin SV</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiêu chí liên quan</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả thành tích</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center text-slate-400 italic">
                          <FileCheck size={64} className="mx-auto text-slate-100 mb-6 opacity-40" />
                          <p className="text-sm font-medium">Hiện không có hồ sơ nào trong hàng đợi.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-7">
                            <p className="font-black text-slate-800 text-sm">#{s.userId.toUpperCase().slice(0, 8)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">Nộp: {s.submittedAt}</p>
                          </td>
                          <td className="px-8 py-7">
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {s.criteriaKeys.map(ck => (
                                <span key={ck} className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tight border border-blue-100/50">
                                  {CATEGORY_LABELS[ck as keyof typeof CATEGORY_LABELS]}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-8 py-7">
                            <p className="font-bold text-slate-800 text-sm mb-1 leading-snug">{s.description}</p>
                            <button className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-2">
                              <Eye size={12} /> Xem {s.files.length} tệp minh chứng
                            </button>
                          </td>
                          <td className="px-8 py-7">
                            <div className="flex flex-col gap-1.5">
                              <span className={`text-[9px] w-fit font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${s.status === EvidenceStatus.APPROVED ? 'bg-green-50 text-green-600 border-green-100' :
                                s.status === EvidenceStatus.REJECTED ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                {s.status === EvidenceStatus.PENDING ? 'Chờ duyệt' : (s.status === EvidenceStatus.APPROVED ? 'Hợp lệ' : 'Từ chối')}
                              </span>
                              {s.status === EvidenceStatus.REJECTED && s.adminComment && (
                                <p className="text-[10px] text-rose-500 italic max-w-[150px] leading-tight">Lý do: {s.adminComment}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-7">
                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleAction(s.id, EvidenceStatus.APPROVED)}
                                disabled={s.status === EvidenceStatus.APPROVED}
                                className="p-3 text-green-600 bg-green-50/50 hover:bg-green-100 rounded-2xl transition-all disabled:opacity-20 border border-green-100/30"
                                title="Xác nhận Hợp lệ"
                              >
                                <CheckCircle size={22} />
                              </button>
                              <button
                                onClick={() => handleAction(s.id, EvidenceStatus.REJECTED)}
                                disabled={s.status === EvidenceStatus.REJECTED}
                                className="p-3 text-rose-600 bg-rose-50/50 hover:bg-rose-100 rounded-2xl transition-all disabled:opacity-20 border border-rose-100/30"
                                title="Yêu cầu Bổ sung/Từ chối"
                              >
                                <XCircle size={22} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Quản lý Hoạt động & Sự kiện</h2>
                <p className="text-slate-500 font-medium">Đăng tải các sự kiện giúp sinh viên hoàn thiện tiêu chí SV5T.</p>
              </div>
              <button
                onClick={() => {
                  setShowEventForm(!showEventForm);
                  setEditingEventId(null);
                  setEventForm({ title: '', date: '', description: '', categories: [], location: '', link: '' });
                }}
                className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-3"
              >
                <CalendarPlus size={20} /> {showEventForm ? 'Đóng' : 'Tạo sự kiện mới'}
              </button>
            </header>

            {showEventForm && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-800">{editingEventId ? 'Chỉnh sửa' : 'Tạo mới'} sự kiện</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên sự kiện</label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Vd: Hội thảo Kỹ năng số..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày tổ chức</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">??a ?i?m</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="Vd: H?i tr??ng A, Ph�ng B.201..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link ??ng k� (T�y ch?n)</label>
                    <input
                      type="text"
                      value={eventForm.link}
                      onChange={(e) => setEventForm({ ...eventForm, link: e.target.value })}
                      placeholder="Vd: https://forms.gle/..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu chí hỗ trợ</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => toggleCategory(key)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl transition-all border ${eventForm.categories.includes(key)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-200'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả sự kiện</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Mô tả chi tiết về sự kiện..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    {editingEventId ? 'Cập nhật' : 'Tạo'} sự kiện
                  </button>
                  <button
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEventId(null);
                      setEventForm({ title: '', date: '', description: '', categories: [], location: '', link: '' });
                    }}
                    className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div key={event.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-blue-200 hover:shadow-md transition-all relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-wrap gap-1.5">
                      {event.categories.map(c => (
                        <span key={c} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tight border border-blue-100/50">
                          {CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 rounded-xl"
                      >
                        <FileCheck size={16} />
                      </button>
                      <button
                        onClick={() => setEvents(events.filter(e => e.id !== event.id))}
                        className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-black text-xl text-slate-800 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{event.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6 italic">"{event.description}"</p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="text-blue-500">📍</span> {event.location}
                    </div>
                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                      {event.date}
                    </div>
                  </div>
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-4 py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors text-center border border-blue-100 flex items-center justify-center gap-2"
                    >
                      👉 Đăng ký tham dự
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'students' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
            <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Danh sách Hồ sơ Sinh viên</h2>
              <div className="flex gap-3">
                <button
                  onClick={fetchStudents}
                  className="px-6 py-3 bg-green-500 text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Làm mới
                </button>
                <select
                  value={studentFilters.faculty}
                  onChange={(e) => {
                    setStudentFilters({ ...studentFilters, faculty: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Tất cả khoa</option>
                  <option value="Công nghệ Thông tin">Công nghệ Thông tin</option>
                  <option value="Kinh tế - Quản trị">Kinh tế - Quản trị</option>
                  <option value="Cơ khí - Kỹ thuật">Cơ khí - Kỹ thuật</option>
                  <option value="Ngôn ngữ & Văn hóa">Ngôn ngữ & Văn hóa</option>
                </select>
                <select
                  value={studentFilters.status}
                  onChange={(e) => {
                    setStudentFilters({ ...studentFilters, status: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Đủ điều kiện">Đủ điều kiện</option>
                  <option value="Gần đạt">Gần đạt</option>
                  <option value="Chưa đạt">Chưa đạt</option>
                </select>
              </div>
            </header>

            {loadingStudents ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Đang tải dữ liệu sinh viên...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
                {/* Mobile list */}
                <div className="md:hidden divide-y divide-slate-100">
                  {paginatedStudents.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Không tìm thấy sinh viên nào</div>
                  ) : (
                    paginatedStudents.map((student) => (
                      <div key={student.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">MSSV: {student.mssv}</p>
                          </div>
                          <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${student.status === 'Đủ điều kiện' ? 'bg-green-50 text-green-600 border-green-100' :
                            student.status === 'Gần đạt' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            {student.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-600">{student.faculty}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${student.completionPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{student.completionPercent}%</span>
                          </div>
                          <span className="text-sm font-black text-slate-800">GPA {student.gpa}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">MSSV & Tên</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khoa</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GPA</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiến độ</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">MSSV: {student.mssv}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-700">{student.faculty}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-slate-800">{student.gpa}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${student.completionPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{student.completionPercent}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${student.status === 'Đủ điều kiện' ? 'bg-green-50 text-green-600 border-green-100' :
                            student.status === 'Gần đạt' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>

                {filteredStudents.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-slate-500">Không tìm thấy sinh viên nào</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} của {filteredStudents.length} sinh viên
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Tiếp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'scholarships' && scholarships && setScholarships && (
          <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Quản lý Học bổng SV5T</h2>
                <p className="text-slate-500 font-medium">Đăng tải các thông tin học bổng dành cho Sinh viên 5 Tốt.</p>
              </div>
              <button
                onClick={() => {
                  setShowScholarshipForm(!showScholarshipForm);
                  setScholarshipForm({ name: '', content: '', expiryDate: '' });
                }}
                className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-3"
              >
                <GraduationCap size={20} /> {showScholarshipForm ? 'Đóng' : 'Thêm học bổng mới'}
              </button>
            </header>

            {showScholarshipForm && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-xl font-bold text-slate-800">Thông tin học bổng</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên học bổng</label>
                    <input
                      type="text"
                      value={scholarshipForm.name}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, name: e.target.value })}
                      placeholder="Vd: Học bổng Odon Vallet 2025..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày hết hạn (Hệ thống sẽ tự xóa khi quá hạn)</label>
                    <input
                      type="date"
                      value={scholarshipForm.expiryDate}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, expiryDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung chi tiết</label>
                  <textarea
                    value={scholarshipForm.content}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, content: e.target.value })}
                    placeholder="Mô tả chi tiết về điều kiện, giá trị, và cách thức nộp hồ sơ..."
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (!scholarshipForm.name || !scholarshipForm.expiryDate || !scholarshipForm.content) {
                        alert('Vui lòng điền đầy đủ thông tin học bổng');
                        return;
                      }
                      
                      // 💾 LOCAL STORAGE MODE - Hiện tại dùng localStorage
                      const newScholarship: Scholarship = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: scholarshipForm.name,
                        content: scholarshipForm.content,
                        expiryDate: scholarshipForm.expiryDate,
                        createdAt: new Date().toISOString()
                      };
                      setScholarships([...scholarships, newScholarship]);
                      
                      // 🔄 API INTEGRATION - Uncomment để lưu scholarship qua API
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
                      
                      setShowScholarshipForm(false);
                      setScholarshipForm({ name: '', content: '', expiryDate: '' });
                      alert('Đã thêm học bổng thành công!');
                    }}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    Đăng thông báo
                  </button>
                  <button
                    onClick={() => {
                      setShowScholarshipForm(false);
                      setScholarshipForm({ name: '', content: '', expiryDate: '' });
                    }}
                    className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scholarships.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <GraduationCap size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">Chưa có thông báo học bổng nào.</p>
                </div>
              ) : (
                scholarships.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-blue-200 hover:shadow-md transition-all relative flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        Học bổng SV5T
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn xóa học bổng này?')) {
                            // 💾 LOCAL STORAGE MODE - Hiện tại dùng localStorage
                            setScholarships(scholarships.filter(item => item.id !== s.id));
                            
                            // 🔄 API INTEGRATION - Uncomment để xóa qua API
                            // (async () => {
                            //   try {
                            //     await scholarshipAPI.delete(s.id);
                            //     setScholarships(scholarships.filter(item => item.id !== s.id));
                            //   } catch (error) {
                            //     console.error('Error deleting scholarship:', error);
                            //     alert('Lỗi xóa học bổng. Vui lòng thử lại.');
                            //   }
                            // })();
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl hover:bg-rose-50"
                        title="Xóa học bổng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h4 className="font-black text-xl text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{s.name}</h4>

                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500">
                      <Clock size={14} className="text-amber-500" />
                      <span>Hết hạn: {new Date(s.expiryDate).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1 whitespace-pre-wrap">{s.content}</p>

                    <div className="pt-4 border-t border-slate-100 mt-auto">
                      <p className="text-[10px] text-slate-400 italic text-right">Đăng ngày: {new Date(s.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
            <header>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Cài đặt Tài khoản</h2>
              <p className="text-slate-500 font-medium">Quản lý thông tin và bảo mật tài khoản admin.</p>
            </header>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Đổi mật khẩu</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                <button
                  onClick={handleChangePassword}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminView;
