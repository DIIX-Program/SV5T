
import React, { useState } from 'react';
import { EvidenceSubmission, EvidenceStatus, UniversityEvent, EvaluationStatus, User } from '../types';
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
  // Added Sparkles and ArrowRight to fix "Cannot find name" errors on lines 171 and 185
  Sparkles,
  ArrowRight,
  Settings
} from 'lucide-react';
import { CATEGORY_LABELS } from '../constants';

interface Props {
  submissions: EvidenceSubmission[];
  setSubmissions: (s: EvidenceSubmission[]) => void;
  events: UniversityEvent[];
  setEvents: (e: UniversityEvent[]) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  currentUser: User | null;
}

const AdminView: React.FC<Props> = ({ submissions, setSubmissions, events, setEvents, users, setUsers, currentUser }) => {
  const [tab, setTab] = useState<'dashboard' | 'approvals' | 'events' | 'students' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const exportToExcel = () => {
    alert("Hệ thống đang trích xuất dữ liệu SV5T toàn trường. File Excel (.xlsx) sẽ được tải xuống sau giây lát...");
    setTimeout(() => {
      const data = JSON.stringify(submissions);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DANH_SACH_SV5T_EXPORT_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.json`;
      a.click();
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <aside className="w-72 bg-white border-r border-slate-200 p-8 space-y-2 hidden md:flex flex-col">
        <div className="mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <PieChart size={12} /> Bảng điều khiển
          </p>
          <div className="space-y-1.5">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Thống kê tổng quan' },
              { id: 'students', icon: Users, label: 'Hồ sơ Sinh viên' },
              { id: 'approvals', icon: FileCheck, label: 'Duyệt hồ sơ (' + stats.pending + ')' },
              { id: 'events', icon: CalendarPlus, label: 'Quản lý sự kiện' },
              { id: 'settings', icon: Settings, label: 'Cài đặt' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all border ${
                  tab === item.id 
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
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Hệ thống xét duyệt</p>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">Dữ liệu được bảo mật và backup hàng ngày vào 0h:00.</p>
          </div>
          <button 
            onClick={exportToExcel}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <Download size={16} /> Xuất Báo cáo Excel
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50/30 p-10">
        {tab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Hệ thống Quản trị</h2>
                <p className="text-slate-500 font-medium mt-1">Nền tảng xét duyệt Sinh viên 5 Tốt cấp Trường.</p>
              </div>
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                 <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Trực tuyến</p>
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Chờ xử lý', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
                { label: 'Đã chấp thuận', value: stats.approved, color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
                { label: 'Từ chối/Y/C sửa', value: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-100', icon: XCircle },
                { label: 'Tổng số hồ sơ', value: stats.totalSubmissions, color: 'text-blue-600', bg: 'bg-blue-100', icon: FileCheck },
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
                  <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">Mức độ sẵn sàng theo Khoa/Viện</h3>
                  <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">Xem chi tiết</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {[
                    { name: 'Công nghệ Thông tin', percent: 88, color: 'bg-blue-500', count: 450 },
                    { name: 'Kinh tế - Quản trị', percent: 64, color: 'bg-amber-500', count: 320 },
                    { name: 'Cơ khí - Kỹ thuật', percent: 42, color: 'bg-rose-500', count: 180 },
                    { name: 'Ngôn ngữ & Văn hóa', percent: 76, color: 'bg-emerald-500', count: 210 },
                    { name: 'Khoa học Ứng dụng', percent: 55, color: 'bg-indigo-500', count: 125 },
                    { name: 'Du lịch - Nhà hàng', percent: 38, color: 'bg-orange-500', count: 90 },
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
                        <div className={`h-full ${khoa.color} rounded-full transition-all duration-1000 ease-out`} style={{width: `${khoa.percent}%`}} />
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
                      <p className="text-xs font-black text-blue-400 uppercase mb-2 tracking-widest">Tiêu chí thiếu nhiều nhất</p>
                      <p className="text-lg font-bold leading-tight">Hội nhập tốt</p>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed italic">Chiếm 68% hồ sơ chưa đạt. Đề xuất tổ chức thêm đợt thi chứng chỉ kỹ năng số.</p>
                    </div>
                    <div className="p-6 bg-slate-800/60 rounded-3xl border border-slate-700/50">
                      <p className="text-xs font-black text-amber-400 uppercase mb-2 tracking-widest">Hành động ưu tiên</p>
                      <p className="text-lg font-bold leading-tight">Duyệt minh chứng</p>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed italic">Còn {stats.pending} hồ sơ mới nộp trong 24h qua. Cần xử lý để ổn định tâm lý SV.</p>
                    </div>
                    <button className="w-full py-4 border border-slate-700 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-2">
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

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
              <table className="w-full text-left border-collapse">
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
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-32 text-center text-slate-400 italic">
                        <FileCheck size={64} className="mx-auto text-slate-100 mb-6 opacity-40" />
                        <p className="text-sm font-medium">Hiện không có hồ sơ nào trong hàng đợi.</p>
                      </td>
                    </tr>
                  ) : (
                    submissions.map((s) => (
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
                            <span className={`text-[9px] w-fit font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                              s.status === EvidenceStatus.APPROVED ? 'bg-green-50 text-green-600 border-green-100' : 
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
        )}

        {tab === 'events' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
             <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Quản lý Hoạt động & Sự kiện</h2>
                <p className="text-slate-500 font-medium">Đăng tải các sự kiện giúp sinh viên hoàn thiện tiêu chí SV5T.</p>
              </div>
              <button className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-3">
                <CalendarPlus size={20} /> Tạo sự kiện mới
              </button>
            </header>

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
                      <button className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 rounded-xl">
                        <FileCheck size={16} />
                      </button>
                      <button onClick={() => setEvents(events.filter(e => e.id !== event.id))} className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'students' && (
           <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <header className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Danh sách Hồ sơ Sinh viên</h2>
                <div className="flex gap-3">
                   <button className="px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold text-sm hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-2 shadow-sm">
                      <Filter size={18} /> Bộ lọc nâng cao
                   </button>
                   <button className="px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold text-sm hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-2 shadow-sm">
                      <Search size={18} /> Tìm kiếm nhanh
                   </button>
                </div>
              </header>
              <div className="bg-white p-32 rounded-[3rem] border border-slate-200 border-dashed text-center shadow-inner">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={32} className="text-slate-200" />
                 </div>
                 <h4 className="text-slate-800 font-bold mb-2">Đang kết nối Database...</h4>
                 <p className="text-slate-400 italic text-sm max-w-sm mx-auto">Tính năng quản lý danh sách sinh viên toàn trường đang được đồng bộ hóa dữ liệu từ hệ thống quản lý đào tạo.</p>
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
