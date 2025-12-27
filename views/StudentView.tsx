import React, { useState } from 'react';
import { 
  AuthUser,
  UserProfile, 
  CriteriaData, 
  EvaluationResult, 
  EvidenceSubmission, 
  StudentType, 
  UniversityEvent,
  EvaluationStatus
} from '../types';
import CriteriaForm from '../components/CriteriaForm';
import ResultDashboard from '../components/ResultDashboard';
import EvidenceUploader from '../components/EvidenceUploader';
import { CATEGORY_LABELS } from '../constants';
import { Sparkles, ArrowRight, Calendar, ExternalLink, UserPlus, Info, Save, ChevronRight } from 'lucide-react';

interface Props {
  authUser: AuthUser | null;
  onLogin: (type: 'google' | 'phone' | 'guest') => void;
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  criteria: CriteriaData;
  setCriteria: (c: CriteriaData) => void;
  submissions: EvidenceSubmission[];
  setSubmissions: (s: EvidenceSubmission[]) => void;
  evaluationResult: EvaluationResult;
  events: UniversityEvent[];
}

const StudentView: React.FC<Props> = ({ 
  authUser, onLogin, profile, setProfile, criteria, setCriteria, submissions, setSubmissions, evaluationResult, events 
}) => {
  const [tempProfile, setTempProfile] = useState<Partial<UserProfile>>({
    studentType: StudentType.UNIVERSITY
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const fullName = (tempProfile.fullName || '').trim();
    if (!fullName) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    const mssv = (tempProfile.mssv || '').trim();
    // Cỏ thể add regex kiểm tra định dạng MSSV tùy chỉnh theo mỗi trường
    if (!mssv) {
      newErrors.mssv = 'Mã số sinh viên không được để trống';
    } else if (!/^\d{10}$/.test(mssv)) {
      newErrors.mssv = 'MSSV phải là 10 chữ số. Ví dụ: 1923050001';
    }

    const className = (tempProfile.className || '').trim();
    if (!className) {
      newErrors.className = 'Lớp không được để trống';
    }

    const faculty = (tempProfile.faculty || '').trim();
    if (!faculty) {
      newErrors.faculty = 'Khoa đào tạo không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Auto-switch to guest mode if user hasn't chosen a login option
      if (!authUser) {
        onLogin('guest'); // guest mode
      }
      // Nếu hợp lệ, trim tất cả dữ liệu trước khi lưu
      const trimmedProfile: Partial<UserProfile> = {
        ...tempProfile,
        fullName: (tempProfile.fullName || '').trim(),
        mssv: (tempProfile.mssv || '').trim(),
        className: (tempProfile.className || '').trim(),
        faculty: (tempProfile.faculty || '').trim(),
      };
      setProfile({ ...trimmedProfile, userId: authUser?.id || 'guest' } as UserProfile);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto mt-20 px-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-blue-600" size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Thông tin cá nhân</h2>
            <p className="text-slate-500 mt-2">Cần thiết để phân loại và định hướng tiêu chuẩn SV5T chính xác cho bạn.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <input 
                  placeholder="Họ và tên" 
                  className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 transition-all border-2 ${
                    errors.fullName 
                      ? 'border-red-400 focus:ring-red-100 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  onChange={e => {
                    setTempProfile({ ...tempProfile, fullName: e.target.value }); // dùng fullName, có thể điều chỉnh dữ liệu sau
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">⚠️ {errors.fullName}</p>
                )}
              </div>
              <div>
                <input 
                  placeholder="Mã số sinh viên (MSSV)" 
                  className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 transition-all border-2 ${
                    errors.mssv 
                      ? 'border-red-400 focus:ring-red-100 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  onChange={e => {
                    setTempProfile({...tempProfile, mssv: e.target.value});
                    if (errors.mssv) setErrors({...errors, mssv: ''});
                  }}
                />
                {errors.mssv && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">⚠️ {errors.mssv}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input 
                    placeholder="Lớp" 
                    className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 transition-all border-2 ${
                      errors.className 
                        ? 'border-red-400 focus:ring-red-100 focus:border-red-400' 
                        : 'border-slate-200 focus:ring-blue-100'
                    }`}
                    onChange={e => {
                      setTempProfile({...tempProfile, className: e.target.value});
                      if (errors.className) setErrors({...errors, className: ''});
                    }}
                  />
                  {errors.className && (
                    <p className="text-red-500 text-sm mt-1.5 font-medium">⚠️ {errors.className}</p>
                  )}
                </div>
                <div>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    onChange={e => setTempProfile({...tempProfile, studentType: e.target.value as StudentType})}
                  >
                    <option value={StudentType.UNIVERSITY}>Đại học</option>
                    <option value={StudentType.COLLEGE}>Cao đẳng</option>
                  </select>
                </div>
              </div>

              <div>
                <input 
                  placeholder="Khoa đào tạo" 
                  className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 transition-all border-2 ${
                    errors.faculty 
                      ? 'border-red-400 focus:ring-red-100 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  onChange={e => {
                    setTempProfile({...tempProfile, faculty: e.target.value});
                    if (errors.faculty) setErrors({...errors, faculty: ''});
                  }}
                />
                {errors.faculty && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">⚠️ {errors.faculty}</p>
                )}
              </div>
            </div>
            <button 
              onClick={handleContinue}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all mt-6"
            >
              TIẾP TỤC <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const failingCategories = (Object.keys(evaluationResult.categoryResults) as (keyof typeof evaluationResult.categoryResults)[])
    .filter(key => !evaluationResult.categoryResults[key].isHardPassed);

  const recommendedEvents = events.filter(e => 
    e.categories.some(cat => failingCategories.includes(cat as any))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {authUser?.isGuest && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-500">
          <div className="flex items-center gap-3">
            <Info className="text-amber-500" size={24} />
            <div>
              <p className="text-sm font-bold text-amber-900">Dữ liệu đang được lưu tạm thời!</p>
              <p className="text-xs text-amber-700">Đăng nhập để lưu hồ sơ vĩnh viễn và theo dõi tiến trình duyệt minh chứng.</p>
            </div>
          </div>
          <button 
            onClick={() => onLogin('google')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-100"
          >
            <Save size={14} /> ĐĂNG NHẬP ĐỂ LƯU
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-12">
          <header>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              Chào, {authUser?.name.split(' ').pop()} 👋
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{profile.fullName}</span>
              <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">MSSV: {profile.mssv}</span>
              <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{profile.faculty}</span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{profile.studentType === StudentType.UNIVERSITY ? 'Đại học' : 'Cao đẳng'}</span>
            </div>
          </header>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Hồ sơ Tiêu chí</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <Sparkles size={14} /> TỰ ĐÁNH GIÁ (DỰA TRÊN 201-QĐ/TWHSV)
              </div>
            </div>
            <CriteriaForm data={criteria} onChange={setCriteria} />
          </section>

          <section>
            <EvidenceUploader submissions={submissions} setSubmissions={setSubmissions} userId={authUser?.id || 'guest'} />
          </section>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="sticky top-24 space-y-8">
            <ResultDashboard result={evaluationResult} />

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative group transition-all hover:border-blue-100">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Sparkles size={120} className="text-blue-600" />
              </div>
              <h4 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-tight">
                <Info size={24} className="text-blue-500" />
                Lộ trình cải thiện
              </h4>
              
              <div className="space-y-4">
                {failingCategories.length === 0 ? (
                  <div className="p-5 bg-green-50 border border-green-100 rounded-3xl text-sm text-green-700 font-bold flex items-start gap-3">
                    <Sparkles className="shrink-0 mt-1" size={18} />
                    <span>Chúc mừng! Bạn đã đạt đủ tất cả tiêu chí cứng. Hãy nộp minh chứng ngay để Admin phê duyệt.</span>
                  </div>
                ) : (
                  failingCategories.map(cat => (
                    <div key={cat} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{CATEGORY_LABELS[cat]}</p>
                        <ChevronRight size={14} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 leading-tight">
                        {evaluationResult.categoryResults[cat].tips[0]}
                      </p>
                      {evaluationResult.categoryResults[cat].hardFails.map((fail, idx) => (
                        <p key={idx} className="text-[11px] text-rose-500 font-medium italic">- {fail}</p>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/10 border border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-black text-lg flex items-center gap-3 uppercase tracking-tight">
                  <Calendar size={24} className="text-blue-400" />
                  Sự kiện đề xuất
                </h4>
              </div>

              <div className="space-y-5">
                {recommendedEvents.length > 0 ? (
                  recommendedEvents.map(event => (
                    <div key={event.id} className="p-5 bg-slate-800/40 rounded-3xl border border-slate-700/50 group hover:border-blue-500/50 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap gap-1">
                          {event.categories.map(c => (
                            <span key={c} className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                              {CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">{event.date}</span>
                      </div>
                      <p className="font-bold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors leading-snug">{event.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{event.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">📍 {event.location}</span>
                        {event.link ? (
                          <a 
                            href={event.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1 hover:text-blue-300 transition-colors"
                          >
                            Đăng ký <ExternalLink size={12}/>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Chưa có link</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-6 border border-dashed border-slate-700 rounded-3xl">
                    <p className="text-xs text-slate-500 italic mb-2">Không tìm thấy sự kiện khớp với tiêu chí bạn còn thiếu.</p>
                    <p className="text-[10px] text-slate-600">Thường xuyên kiểm tra để không bỏ lỡ hoạt động mới.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
