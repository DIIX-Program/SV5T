import React, { useState } from 'react';
import {
  AuthUser,
  UserProfile,
  CriteriaData,
  EvaluationResult,
  EvidenceSubmission,
  StudentType,
  UniversityEvent,
  EvaluationStatus,
  Confession,
  Scholarship
} from '../types';
import ConfessionBoard from '../components/ConfessionBoard';
import CriteriaForm from '../components/CriteriaForm';
import ResultDashboard from '../components/ResultDashboard';
import EvidenceUploader from '../components/EvidenceUploader';
import { CATEGORY_LABELS } from '../constants';
import { Sparkles, ArrowRight, Calendar, ExternalLink, UserPlus, Info, Save, ChevronRight, GraduationCap, Clock, AlertCircle } from 'lucide-react';

interface Props {
  authUser: AuthUser | null;
  onRequireLogin: () => void;
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  criteria: CriteriaData;
  setCriteria: (c: CriteriaData) => void;
  submissions: EvidenceSubmission[];
  setSubmissions: (s: EvidenceSubmission[]) => void;
  evaluationResult: EvaluationResult;
  events: UniversityEvent[];
  confessions?: Confession[];
  setConfessions?: (c: Confession[]) => void;
  scholarships?: Scholarship[];
}

const StudentView: React.FC<Props> = ({
  authUser, onRequireLogin, profile, setProfile, criteria, setCriteria, submissions, setSubmissions, evaluationResult, events, confessions, setConfessions, scholarships
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'confession'>('dashboard');
  const [tempProfile, setTempProfile] = useState<Partial<UserProfile>>({
    studentType: StudentType.UNIVERSITY
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddConfession = (newConfession: Omit<Confession, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    if (!confessions || !setConfessions) return;
    const confession: Confession = {
      ...newConfession,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      likes: 0,
      commentsList: []
    };
    setConfessions([confession, ...confessions]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const fullName = (tempProfile.fullName || '').trim();
    if (!fullName) {
      newErrors.fullName = 'H? tên không ???c ?? tr?ng';
    }

    const className = (tempProfile.className || '').trim();
    if (!className) {
      newErrors.className = 'L?p không ???c ?? tr?ng';
    }

    const faculty = (tempProfile.faculty || '').trim();
    if (!faculty) {
      newErrors.faculty = 'Khoa ?ào t?o không ???c ?? tr?ng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      const trimmedProfile: Partial<UserProfile> = {
        ...tempProfile,
        fullName: (tempProfile.fullName || '').trim(),
        className: (tempProfile.className || '').trim(),
        faculty: (tempProfile.faculty || '').trim(),
      };
      setProfile({ 
        ...trimmedProfile, 
        userId: authUser?.id || 'guest',
        mssv: authUser?.mssv || ''
      } as UserProfile);
    }
  };

  // If user is not authenticated, show message to login
  if (!authUser) {
    return (
      <div className="max-w-2xl mx-auto mt-20 px-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-blue-600" size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">C?n ??ng Nh?p</h2>
            <p className="text-slate-600 mt-2">?? truy c?p các tính n?ng ?ánh giá Sinh viên 5 T?t, vui lòng ??ng nh?p ho?c ??ng ký tài kho?n.</p>
          </div>
          <button
            onClick={onRequireLogin}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <ArrowRight size={20} /> ??ng Nh?p Ngay
          </button>
        </div>
      </div>
    );
  }

  // If profile is not set, show profile form
  if (!profile) {
    return (
      <div className="max-w-xl mx-auto mt-20 px-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-blue-600" size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Hoàn T?t H? S?</h2>
            <p className="text-slate-500 mt-2">C?n thi?t ?? xác ??nh tiêu chu?n SV5T phù h?p cho b?n.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <input
                  placeholder="H? và tên"
                  className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 transition-all border-2 ${errors.fullName
                    ? 'border-red-400 focus:ring-red-100 focus:border-red-400'
                    : 'border-slate-200 focus:ring-blue-100'
                    }`}
                  onChange={e => {
                    setTempProfile({ ...tempProfile, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">?? {errors.fullName}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    placeholder="L?p"
                    className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 transition-all border-2 ${errors.className
                      ? 'border-red-400 focus:ring-red-100 focus:border-red-400'
                      : 'border-slate-200 focus:ring-blue-100'
                      }`}
                    onChange={e => {
                      setTempProfile({ ...tempProfile, className: e.target.value });
                      if (errors.className) setErrors({ ...errors, className: '' });
                    }}
                  />
                  {errors.className && (
                    <p className="text-red-500 text-sm mt-1.5 font-medium">?? {errors.className}</p>
                  )}
                </div>
                <div>
                  <select
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    onChange={e => setTempProfile({ ...tempProfile, studentType: e.target.value as StudentType })}
                  >
                    <option value={StudentType.UNIVERSITY}>??i h?c</option>
                    <option value={StudentType.COLLEGE}>Cao ??ng</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  placeholder="Khoa ?ào t?o"
                  className={`w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 transition-all border-2 ${errors.faculty
                    ? 'border-red-400 focus:ring-red-100 focus:border-red-400'
                    : 'border-slate-200 focus:ring-blue-100'
                    }`}
                  onChange={e => {
                    setTempProfile({ ...tempProfile, faculty: e.target.value });
                    if (errors.faculty) setErrors({ ...errors, faculty: '' });
                  }}
                />
                {errors.faculty && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">?? {errors.faculty}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all mt-6"
            >
              TI?P T?C <ArrowRight size={20} />
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-12">
          <header>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              Chào, {profile.fullName?.split(' ').pop() || 'b?n'} ??
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{profile.fullName}</span>
              <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">MSSV: {profile.mssv}</span>
              <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{profile.faculty}</span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{profile.studentType === StudentType.UNIVERSITY ? '??i h?c' : 'Cao ??ng'}</span>
            </div>
          </header>

          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              H? s? 5 T?t
            </button>
            {confessions && setConfessions && (
              <button
                onClick={() => setActiveTab('confession')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'confession' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Góc Tâm S?
              </button>
            )}
          </div>

          {activeTab === 'dashboard' ? (
            <>
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">H? s? Tiêu chí</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <Sparkles size={14} /> T? ?ÁNH GIÁ (D?A TRÊN 201-Q?/TWHSV)
                  </div>
                </div>
                <CriteriaForm data={criteria} onChange={setCriteria} />
              </section>

              <section>
                <EvidenceUploader submissions={submissions} setSubmissions={setSubmissions} userId={authUser?.id || 'guest'} />
              </section>
            </>
          ) : confessions && setConfessions ? (
            <ConfessionBoard
              confessions={confessions}
              onAddConfession={handleAddConfession}
              onUpdateConfession={(updatedConfession) => {
                setConfessions(confessions.map(c => c.id === updatedConfession.id ? updatedConfession : c));
              }}
              onDeleteConfession={(id) => {
                setConfessions(confessions.filter(c => c.id !== id));
              }}
            />
          ) : null}
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
                L? trình c?i thi?n
              </h4>

              <div className="space-y-4">
                {/* SV5T Notification Section */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <GraduationCap size={100} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Thông báo quan tr?ng</p>
                  <h3 className="text-xl font-bold mb-3 leading-tight">Xét duy?t danh hi?u Sinh viên 5 T?t</h3>

                  {(() => {
                    const today = new Date();
                    const currentYear = today.getFullYear();
                    let targetYear = currentYear;
                    const startOfCycle = new Date(currentYear, 7, 1);
                    if (today >= startOfCycle) {
                      targetYear = currentYear + 1;
                    }
                    const deadlineDate = new Date(targetYear, 7, 1);
                    const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    return (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <p className="text-xs font-medium opacity-90 mb-1">H?n chót n?p h? s?:</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-white">{diffDays}</span>
                          <span className="text-sm font-bold mb-1.5 opacity-80">ngày còn l?i</span>
                        </div>
                        <p className="text-[10px] opacity-60 mt-2 italic">Tính ??n ngày 01/08/{targetYear}</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Scholarship Notifications */}
                {scholarships && scholarships.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mt-6 mb-2">
                      <GraduationCap size={16} className="text-amber-500" />
                      <h4 className="text-sm font-black text-slate-700 uppercase tracking-tight">H?c b?ng Active</h4>
                    </div>
                    {scholarships.map(scholarship => (
                      <div key={scholarship.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest border border-amber-100">M?i</span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Clock size={12} />
                            <span>{new Date(scholarship.expiryDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <h5 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-amber-600 transition-colors leading-snug">{scholarship.name}</h5>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{scholarship.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="my-6 border-t border-slate-100"></div>

                {failingCategories.length === 0 ? (
                  <div className="p-5 bg-green-50 border border-green-100 rounded-3xl text-sm text-green-700 font-bold flex items-start gap-3">
                    <Sparkles className="shrink-0 mt-1" size={18} />
                    <span>Chúc m?ng! B?n ?ã ??t ?? t?t c? tiêu chí c?ng. Hãy n?p minh ch?ng ngay ?? Admin phê duy?t.</span>
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
                  S? ki?n ?? xu?t
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
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">?? {event.location}</span>
                        {event.link ? (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1 hover:text-blue-300 transition-colors"
                          >
                            ??ng ký <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Ch?a có link</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-6 border border-dashed border-slate-700 rounded-3xl">
                    <p className="text-xs text-slate-500 italic mb-2">Không tìm th?y s? ki?n kh?p v?i tiêu chí b?n còn thi?u.</p>
                    <p className="text-[10px] text-slate-600">Th??ng xuyên ki?m tra ?? không b? l? ho?t ??ng m?i.</p>
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
