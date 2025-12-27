import React, { useState, useEffect, useMemo } from 'react';
import {
  CriteriaData,
  StudentType,
  EvaluationStatus,
  AuthUser,
  UserRole,
  UserProfile,
  EvidenceSubmission,
  EvidenceStatus,
  UniversityEvent
} from './types';
import { evaluateReadiness } from './services/evaluationService';
import LandingPage from './components/LandingPage';
import StudentView from './views/StudentView';
import AdminView from './views/AdminView';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { Shield, LogOut, Menu, X } from 'lucide-react';

const INITIAL_CRITERIA: CriteriaData = {
  trainingPoints: 0, noDiscipline: true, marxistMember: false, exemplaryYouth: false,
  gpa: 0, scientificResearch: false, journalArticle: false, conferencePaper: false, invention: false,
  academicTeamMember: false, academicCompetitionAward: false, isHealthyStudent: false, sportAward: false,
  volunteerDays: 0, volunteerAward: false, volunteerLeader: false,
  skillCourseOrUnionAward: false, integrationActivity: false, englishB1OrGpa: false,
  internationalExchange: false, foreignLanguageCompetition: false,
};

const DEFAULT_EVENTS: UniversityEvent[] = [
  { id: '1', title: 'Hội thảo: Sinh viên với Hội nhập số', date: '2025-05-15', description: 'Trang bị kỹ năng hội nhập quốc tế.', categories: ['integration'], location: 'Hội trường A' },
  { id: '2', title: 'Giải chạy: SV Khỏe 2025', date: '2025-06-01', description: 'Kiểm tra thể lực SV khỏe.', categories: ['physical'], location: 'Sân vận động' },
  { id: '3', title: 'Mùa hè xanh: Chiến dịch tình nguyện', date: '2025-07-10', description: 'Tình nguyện tại vùng cao.', categories: ['volunteer'], location: 'Đắk Nông' },
  { id: '4', title: 'Hội thi Tìm hiểu Chủ nghĩa Mác-Lênin', date: '2025-08-05', description: 'Cuộc thi đạo đức cách mạng.', categories: ['ethics'], location: 'Phòng B.201' },
];

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sv5t_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sv5t_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [criteria, setCriteria] = useState<CriteriaData>(() => {
    const saved = localStorage.getItem('sv5t_criteria');
    return saved ? JSON.parse(saved) : INITIAL_CRITERIA;
  });

  const [submissions, setSubmissions] = useState<EvidenceSubmission[]>(() => {
    const saved = localStorage.getItem('sv5t_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<UniversityEvent[]>(() => {
    const saved = localStorage.getItem('sv5t_events');
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });

  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('sv5t_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to LocalStorage
  useEffect(() => {
    if (authUser) localStorage.setItem('sv5t_user', JSON.stringify(authUser));
    if (profile) localStorage.setItem('sv5t_profile', JSON.stringify(profile));
    localStorage.setItem('sv5t_criteria', JSON.stringify(criteria));
    localStorage.setItem('sv5t_submissions', JSON.stringify(submissions));
    localStorage.setItem('sv5t_events', JSON.stringify(events));
    localStorage.setItem('sv5t_users', JSON.stringify(users));
  }, [authUser, profile, criteria, submissions, events, users]);

  const evaluationResult = useMemo(() => 
    evaluateReadiness(criteria, profile?.studentType || StudentType.UNIVERSITY), 
    [criteria, profile]
  );

  const handleOpenAuthModal = (mode: 'login' | 'register' | 'admin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleLoginSuccess = (token: string, user: any) => {
    setAuthUser(user);
    // Auto-set profile từ backend user data
    if (user.profile) {
      setProfile({
        userId: user.id,
        mssv: user.mssv,
        name: user.profile.name || user.name || 'Sinh viên',
        className: user.profile.className || 'Chưa cập nhật',
        faculty: user.profile.faculty || 'Chưa cập nhật',
        studentType: user.profile.studentType || StudentType.UNIVERSITY
      });
    }
    setShowAuthModal(false);
    if (user.role === 'ADMIN') {
      setRole('admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sv5t_token');
    localStorage.removeItem('sv5t_user');
    setAuthUser(null);
    setProfile(null);
    setCriteria(INITIAL_CRITERIA);
    setSubmissions([]);
    setRole('student');
  };

  if (!authUser) {
    return (
      <>
        <LandingPage onGetStarted={() => handleOpenAuthModal('login')} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
          mode={authMode}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Shield size={20} />
          </div>
          <span className="font-bold text-slate-800 tracking-tight hidden sm:inline">Sinh Viên 5 Tốt</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Role Switch (Admin only) */}
          {authUser.role === UserRole.ADMIN && (
            <div className="hidden md:flex bg-slate-100 rounded-full p-1">
              <button 
                onClick={() => setRole('student')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'student' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                SINH VIÊN
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'admin' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                QUẢN TRỊ
              </button>
            </div>
          )}
          
          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{authUser.mssv}</p>
              <p className="text-[10px] text-slate-500">{authUser.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên'}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 p-2 transition-colors" title="Đăng xuất">
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
          {authUser.role === UserRole.ADMIN && (
            <div className="flex bg-slate-100 rounded-full p-1">
              <button 
                onClick={() => { setRole('student'); setMobileMenuOpen(false); }}
                className={`flex-1 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'student' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                SINH VIÊN
              </button>
              <button 
                onClick={() => { setRole('admin'); setMobileMenuOpen(false); }}
                className={`flex-1 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${role === 'admin' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                QUẢN TRỊ
              </button>
            </div>
          )}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-800 mb-3">{authUser.mssv}</p>
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-rose-50 text-rose-600 rounded-lg font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {role === 'student' ? (
          <StudentView 
            authUser={authUser}
            onRequireLogin={() => handleOpenAuthModal('login')}
            profile={profile} 
            setProfile={setProfile} 
            criteria={criteria} 
            setCriteria={setCriteria}
            submissions={submissions}
            setSubmissions={setSubmissions}
            evaluationResult={evaluationResult}
            events={events}
          />
        ) : (
          <AdminView 
            submissions={submissions} 
            setSubmissions={setSubmissions}
            events={events}
            setEvents={setEvents}
            users={users}
            setUsers={setUsers}
            currentUser={authUser}
          />
        )}
      </div>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        mode={authMode}
      />
    </div>
  );
}

export default App;
