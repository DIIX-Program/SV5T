import React, { useState, useEffect } from 'react';
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
      alert('Không th? t?i d? li?u sinh viên. Vui lòng ki?m tra k?t n?i server.');
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
      comment = prompt("Nh?p lý do t? ch?i (Vui lòng ghi rõ thi?u minh ch?ng gì):") || "";
      if (!comment) return;
    }
    setSubmissions(submissions.map(s => s.id === id ? { ...s, status, adminComment: comment || s.adminComment } : s));
  };

  const handleChangePassword = () => {
    if (!currentUser) return;
    if (!bcrypt.compareSync(currentPassword, currentUser.passwordHash)) {
      setPasswordError('M?t kh?u hi?n t?i không ?úng');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('M?t kh?u m?i không kh?p');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('M?t kh?u m?i ph?i có ít nh?t 6 ký t?');
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
    alert('M?t kh?u ?ã ???c c?p nh?t thành công!');
  };

  // Event handlers
  const handleAddEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.description || !eventForm.location || eventForm.categories.length === 0) {
      alert('Vui lòng ?i?n ??y ?? thông tin s? ki?n');
      return;
    }

    if (editingEventId) {
      setEvents(events.map(e =>
        e.id === editingEventId
          ? { ...e, ...eventForm }
          : e
      ));
      setEditingEventId(null);
    } else {
      const newEvent: UniversityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        ...eventForm,
        link: eventForm.link || undefined
      };
      setEvents([...events, newEvent]);
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
    alert('S? ki?n ?ã ???c ' + (editingEventId ? 'c?p nh?t' : 't?o') + ' thành công!');
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
    status: '?? ?i?u ki?n',
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
  const exportToExcel = async () => {
    if (studentList.length === 0) {
      alert('Không có d? li?u ?? xu?t');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh sách sinh viên');

      const headerRow = worksheet.addRow(['MSSV', 'Tên sinh viên', 'Khoa', 'GPA', 'Ti?n ?? (%)', 'Tr?ng thái']);

      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      studentList.forEach(s => {
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
      alert('? File Excel ?ã ???c xu?t thành công!');
    } catch (error) {
      console.error('L?i xu?t Excel:', error);
      alert('? L?i khi xu?t file Excel');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <aside className="w-72 bg-white border-r border-slate-200 p-8 space-y-2 hidden md:flex flex-col">
        <div className="mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <PieChart size={12} /> B?ng ?i?u khi?n
          </p>
          <div className="space-y-1.5">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Th?ng kê t?ng quan' },
              { id: 'students', icon: Users, label: 'H? s? Sinh viên' },
              { id: 'approvals', icon: FileCheck, label: 'Duy?t h? s? (' + stats.pending + ')' },
              { id: 'scholarships', icon: GraduationCap, label: 'Qu?n lý H?c b?ng' },
              { id: 'events', icon: CalendarPlus, label: 'Qu?n lý s? ki?n' },
              { id: 'settings', icon: Settings, label: 'Cài ??t' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all border ${tab === item.id
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

        <div className="mt-auto space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">H? th?ng xét duy?t</p>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">D? li?u ???c b?o m?t và backup hàng ngày vào 0h:00.</p>
          </div>
          <button
            onClick={exportToExcel}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <Download size={16} /> Xu?t Báo cáo Excel
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50/30 p-10">
        {tab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">H? th?ng Qu?n tr?</h2>
                <p className="text-slate-500 font-medium mt-1">N?n t?ng xét duy?t Sinh viên 5 T?t c?p Tr??ng.</p>
              </div>
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Tr?c tuy?n</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Ch? x? lý', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
                { label: '?ã ch?p thu?n', value: stats.approved, color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
                { label: 'T? ch?i/Y/C s?a', value: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-100', icon: XCircle },
                { label: 'T?ng s? h? s?', value: stats.totalSubmissions, color: 'text-blue-600', bg: 'bg-blue-100', icon: FileCheck },
              ].map((card, i) => (
                <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                    <card.icon size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                    <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">M?c ?? s?n sàng theo Khoa/Vi?n</h3>
                  <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">Xem chi ti?t</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {[
                    { name: 'Công ngh? Thông tin', percent: 88, color: 'bg-blue-500', count: 450 },
                    { name: 'Kinh t? - Qu?n tr?', percent: 64, color: 'bg-amber-500', count: 320 },
                    { name: 'C? khí - K? thu?t', percent: 42, color: 'bg-rose-500', count: 180 },
                    { name: 'Ngôn ng? & V?n hóa', percent: 76, color: 'bg-emerald-500', count: 210 },
                    { name: 'Khoa h?c ?ng d?ng', percent: 55, color: 'bg-indigo-500', count: 125 },
                    { name: 'Du l?ch - Nhà hàng', percent: 38, color: 'bg-orange-500', count: 90 },
                  ].map((khoa, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-slate-800 leading-tight">{khoa.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{khoa.count} sinh viên</p>
                        </div>
                        <span className="text-sm font-black text-slate-900">{khoa.percent}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${khoa.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${khoa.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/10">
                <h3 className="font-black text-lg uppercase tracking-tight mb-8 text-blue-400 flex items-center gap-2">
                  <Sparkles size={20} /> Phân tích AI
                </h3>
                <div className="space-y-6">
                  <div className="p-6 bg-slate-800/60 rounded-3xl border border-slate-700/50">
                    <p className="text-xs font-black text-blue-400 uppercase mb-2 tracking-widest">Tiêu chí thi?u nhi?u nh?t</p>
                    <p className="text-lg font-bold leading-tight">H?i nh?p t?t</p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed italic">Chi?m 68% h? s? ch?a ??t. ?? xu?t t? ch?c thêm ??t thi ch?ng ch? k? n?ng s?.</p>
                  </div>
                  <div className="p-6 bg-slate-800/60 rounded-3xl border border-slate-700/50">
                    <p className="text-xs font-black text-amber-400 uppercase mb-2 tracking-widest">Hành ??ng ?u tiên</p>
                    <p className="text-lg font-bold leading-tight">Duy?t minh ch?ng</p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed italic">Còn {stats.pending} h? s? m?i n?p trong 24h qua. C?n x? lý ?? ?n ??nh tâm lý SV.</p>
                  </div>
                  <button className="w-full py-4 border border-slate-700 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-2">
                    XU?T BÁO CÁO PHÂN TÍCH <ArrowRight size={14} />
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
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Duy?t h? s? minh ch?ng</h2>
                <p className="text-slate-500 font-medium">Hàng ??i xét duy?t các thành tích sinh viên ?ã c?p nh?t.</p>
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

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin SV</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiêu chí liên quan</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô t? thành tích</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tr?ng thái</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-32 text-center text-slate-400 italic">
                        <FileCheck size={64} className="mx-auto text-slate-100 mb-6 opacity-40" />
                        <p className="text-sm font-medium">Hi?n không có h? s? nào trong hàng ??i.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-7">
                          <p className="font-black text-slate-800 text-sm">#{s.userId.toUpperCase().slice(0, 8)}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">N?p: {s.submittedAt}</p>
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
                            <Eye size={12} /> Xem {s.files.length} t?p minh ch?ng
                          </button>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex flex-col gap-1.5">
                            <span className={`text-[9px] w-fit font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${s.status === EvidenceStatus.APPROVED ? 'bg-green-50 text-green-600 border-green-100' :
                              s.status === EvidenceStatus.REJECTED ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                              {s.status === EvidenceStatus.PENDING ? 'Ch? duy?t' : (s.status === EvidenceStatus.APPROVED ? 'H?p l?' : 'T? ch?i')}
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
                              title="Xác nh?n H?p l?"
                            >
                              <CheckCircle size={22} />
                            </button>
                            <button
                              onClick={() => handleAction(s.id, EvidenceStatus.REJECTED)}
                              disabled={s.status === EvidenceStatus.REJECTED}
                              className="p-3 text-rose-600 bg-rose-50/50 hover:bg-rose-100 rounded-2xl transition-all disabled:opacity-20 border border-rose-100/30"
                              title="Yêu c?u B? sung/T? ch?i"
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
        )}

        {tab === 'events' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Qu?n lý Ho?t ??ng & S? ki?n</h2>
                <p className="text-slate-500 font-medium">??ng t?i các s? ki?n giúp sinh viên hoàn thi?n tiêu chí SV5T.</p>
              </div>
              <button
                onClick={() => {
                  setShowEventForm(!showEventForm);
                  setEditingEventId(null);
                  setEventForm({ title: '', date: '', description: '', categories: [], location: '', link: '' });
                }}
                className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-3"
              >
                <CalendarPlus size={20} /> {showEventForm ? '?óng' : 'T?o s? ki?n m?i'}
              </button>
            </header>

            {showEventForm && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-800">{editingEventId ? 'Ch?nh s?a' : 'T?o m?i'} s? ki?n</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên s? ki?n</label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Vd: H?i th?o K? n?ng s?..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày t? ch?c</label>
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
                      placeholder="Vd: H?i tr??ng A, Phòng B.201..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link ??ng ký (Tùy ch?n)</label>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu chí h? tr?</label>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mô t? s? ki?n</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Mô t? chi ti?t v? s? ki?n..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    {editingEventId ? 'C?p nh?t' : 'T?o'} s? ki?n
                  </button>
                  <button
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEventId(null);
                      setEventForm({ title: '', date: '', description: '', categories: [], location: '', link: '' });
                    }}
                    className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    H?y
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
                      <span className="text-blue-500">??</span> {event.location}
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
                      ?? ??ng ký tham d?
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
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Danh sách H? s? Sinh viên</h2>
              <div className="flex gap-3">
                <button
                  onClick={fetchStudents}
                  className="px-6 py-3 bg-green-500 text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Làm m?i
                </button>
                <select
                  value={studentFilters.faculty}
                  onChange={(e) => {
                    setStudentFilters({ ...studentFilters, faculty: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">T?t c? khoa</option>
                  <option value="Công ngh? Thông tin">Công ngh? Thông tin</option>
                  <option value="Kinh t? - Qu?n tr?">Kinh t? - Qu?n tr?</option>
                  <option value="C? khí - K? thu?t">C? khí - K? thu?t</option>
                  <option value="Ngôn ng? & V?n hóa">Ngôn ng? & V?n hóa</option>
                </select>
                <select
                  value={studentFilters.status}
                  onChange={(e) => {
                    setStudentFilters({ ...studentFilters, status: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">T?t c? tr?ng thái</option>
                  <option value="?? ?i?u ki?n">?? ?i?u ki?n</option>
                  <option value="G?n ??">G?n ??</option>
                  <option value="Ch?a ??">Ch?a ??</option>
                </select>
              </div>
            </header>

            {loadingStudents ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">?ang t?i d? li?u sinh viên...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">MSSV & Tên</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khoa</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GPA</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ti?n ??</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tr?ng thái</th>
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
                          <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${student.status === '?? ?i?u ki?n' ? 'bg-green-50 text-green-600 border-green-100' :
                            student.status === 'G?n ??' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredStudents.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-slate-500">Không tìm th?y sinh viên nào</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Hi?n th? {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} c?a {filteredStudents.length} sinh viên
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Tr??c
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Ti?p
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
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Qu?n lý H?c b?ng SV5T</h2>
                <p className="text-slate-500 font-medium">??ng t?i các thông tin h?c b?ng dành cho Sinh viên 5 T?t.</p>
              </div>
              <button
                onClick={() => {
                  setShowScholarshipForm(!showScholarshipForm);
                  setScholarshipForm({ name: '', content: '', expiryDate: '' });
                }}
                className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-3"
              >
                <GraduationCap size={20} /> {showScholarshipForm ? '?óng' : 'Thêm h?c b?ng m?i'}
              </button>
            </header>

            {showScholarshipForm && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-xl font-bold text-slate-800">Thông tin h?c b?ng</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên h?c b?ng</label>
                    <input
                      type="text"
                      value={scholarshipForm.name}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, name: e.target.value })}
                      placeholder="Vd: H?c b?ng Odon Vallet 2025..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày h?t h?n (H? th?ng s? t? xóa khi quá h?n)</label>
                    <input
                      type="date"
                      value={scholarshipForm.expiryDate}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, expiryDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">N?i dung chi ti?t</label>
                  <textarea
                    value={scholarshipForm.content}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, content: e.target.value })}
                    placeholder="Mô t? chi ti?t v? ?i?u ki?n, giá tr?, và cách th?c n?p h? s?..."
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (!scholarshipForm.name || !scholarshipForm.expiryDate || !scholarshipForm.content) {
                        alert('Vui lòng ?i?n ??y ?? thông tin h?c b?ng');
                        return;
                      }
                      const newScholarship: Scholarship = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: scholarshipForm.name,
                        content: scholarshipForm.content,
                        expiryDate: scholarshipForm.expiryDate,
                        createdAt: new Date().toISOString()
                      };
                      setScholarships([...scholarships, newScholarship]);
                      setShowScholarshipForm(false);
                      setScholarshipForm({ name: '', content: '', expiryDate: '' });
                      alert('?ã thêm h?c b?ng thành công!');
                    }}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    ??ng thông báo
                  </button>
                  <button
                    onClick={() => {
                      setShowScholarshipForm(false);
                      setScholarshipForm({ name: '', content: '', expiryDate: '' });
                    }}
                    className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    H?y
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scholarships.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <GraduationCap size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">Ch?a có thông báo h?c b?ng nào.</p>
                </div>
              ) : (
                scholarships.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-blue-200 hover:shadow-md transition-all relative flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        H?c b?ng SV5T
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm('B?n có ch?c mu?n xóa h?c b?ng này?')) {
                            setScholarships(scholarships.filter(item => item.id !== s.id));
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl hover:bg-rose-50"
                        title="Xóa h?c b?ng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h4 className="font-black text-xl text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{s.name}</h4>

                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500">
                      <Clock size={14} className="text-amber-500" />
                      <span>H?t h?n: {new Date(s.expiryDate).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1 whitespace-pre-wrap">{s.content}</p>

                    <div className="pt-4 border-t border-slate-100 mt-auto">
                      <p className="text-[10px] text-slate-400 italic text-right">??ng ngày: {new Date(s.createdAt).toLocaleDateString('vi-VN')}</p>
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
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Cài ??t Tài kho?n</h2>
              <p className="text-slate-500 font-medium">Qu?n lý thông tin và b?o m?t tài kho?n admin.</p>
            </header>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-6">??i m?t kh?u</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">M?t kh?u hi?n t?i</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">M?t kh?u m?i</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nh?n m?t kh?u m?i</label>
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
                  C?p nh?t m?t kh?u
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
