
import React, { useState, useEffect, useMemo } from 'react';
import {
  CriteriaData,
  StudentType,
  EvaluationStatus,
  AuthUser,
  UserRole,
  User,
  UserProfile,
  EvidenceSubmission,
  EvidenceStatus,
  UniversityEvent,
  Confession,
  Scholarship
} from './types';
import { evaluateReadiness } from './services/evaluationService';
import StudentView from './views/StudentView';
import AdminView from './views/AdminView';
import Footer from './components/Footer';
import { Shield, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import bcrypt from 'bcryptjs';

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

import { NotificationProvider, useNotificationLogic } from './components/NotificationSystem';

const NotificationListener = () => {
  useNotificationLogic();
  return null;
};

// Main App Component
function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sv5t_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState<'student' | 'admin'>('student');

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sv5t_users');
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Seed default admin
      const defaultAdmin: User = {
        id: 'admin-1',
        email: 'admin123@sv5t',
        passwordHash: bcrypt.hashSync('admin123', 10), // Default password: admin123
        role: UserRole.ADMIN,
        name: 'Administrator'
      };
      const initialUsers = [defaultAdmin];
      localStorage.setItem('sv5t_users', JSON.stringify(initialUsers));
      return initialUsers;
    }
  });

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

  const [confessions, setConfessions] = useState<Confession[]>(() => {
    const saved = localStorage.getItem('sv5t_confessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
    const saved = localStorage.getItem('sv5t_scholarships');
    return saved ? JSON.parse(saved) : [];
  });

  // Auto clean expired scholarships
  useEffect(() => {
    // Check expiration against end of today
    const now = new Date();
    // Reset time to midnight for simple date string comparison, or better yet, compare closely
    // Actually, better to compare against the date string from the input.
    // Input gives YYYY-MM-DD.
    // We want to keep it if YYYY-MM-DD >= Today's YYYY-MM-DD.

    // Simplest: Get today's date string in YYYY-MM-DD format (local time)
    const today = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format

    const validScholarships = scholarships.filter(s => {
      // user entered expiryDate is YYYY-MM-DD
      return s.expiryDate >= today;
    });

    if (validScholarships.length !== scholarships.length) {
      setScholarships(validScholarships);
    }
  }, [scholarships]);

  // Sync to LocalStorage
  useEffect(() => {
    if (authUser) localStorage.setItem('sv5t_auth', JSON.stringify(authUser));
    localStorage.setItem('sv5t_users', JSON.stringify(users));
    if (profile) localStorage.setItem('sv5t_profile', JSON.stringify(profile));
    localStorage.setItem('sv5t_criteria', JSON.stringify(criteria));
    localStorage.setItem('sv5t_submissions', JSON.stringify(submissions));
    localStorage.setItem('sv5t_events', JSON.stringify(events));
    localStorage.setItem('sv5t_confessions', JSON.stringify(confessions));
    localStorage.setItem('sv5t_scholarships', JSON.stringify(scholarships));
  }, [authUser, users, profile, criteria, submissions, events, confessions, scholarships]);

  const evaluationResult = useMemo(() =>
    evaluateReadiness(criteria, profile?.studentType || StudentType.UNIVERSITY),
    [criteria, profile]
  );
  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = (type: 'google' | 'phone' | 'guest' | 'admin') => {
    if (type === 'admin') {
      setShowAdminLogin(true);
      return;
    }
    const newUser: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: type === 'guest' ? 'Khách' : 'Nguyễn Văn A',
      email: type === 'guest' ? '' : 'sv.nguyenvana@university.edu.vn',
      role: UserRole.USER,
      isGuest: type === 'guest'
    };
    setAuthUser(newUser);
  };

  const handleAdminLogin = () => {
    const user = users.find(u => u.email === adminUsername);
    if (user && bcrypt.compareSync(adminPassword, user.passwordHash)) {
      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isGuest: false
      };
      setAuthUser(authUser);
      setShowAdminLogin(false);
      setAdminUsername('');
      setAdminPassword('');
      setLoginError('');
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthUser(null);
    setProfile(null);
    setCriteria(INITIAL_CRITERIA);
    setSubmissions([]);
    setRole('student');
    window.location.reload();
  };

  return (
    <NotificationProvider>
      <NotificationListener />
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col">
        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-center mb-4">Đăng nhập Admin</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleAdminLogin}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminUsername('');
                      setAdminPassword('');
                      setLoginError('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Shield size={20} />
            </div>
            <span className="font-bold text-slate-800 tracking-tight hidden sm:inline">SV5T MANAGER</span>
          </div>

          <div className="flex items-center gap-4">
            {authUser?.role === UserRole.ADMIN && (
              <div className="bg-slate-100 rounded-full p-1 flex">
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
                  ADMIN
                </button>
              </div>
            )}

            {authUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-slate-800">{authUser.name}</p>
                  <p className="text-[10px] text-slate-500">{authUser.isGuest ? 'Guest' : 'Member'}</p>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 p-2 transition-colors" title="Đăng xuất">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => handleLogin('guest')} className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4">Xem nhanh</button>
                <button onClick={() => handleLogin('admin')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-700 transition-all">
                  <Shield size={14} /> Admin
                </button>
                <button onClick={() => handleLogin('google')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                  <LogIn size={14} /> Đăng nhập
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1">
          {role === 'student' ? (
            <StudentView
              authUser={authUser}
              onLogin={handleLogin}
              profile={profile}
              setProfile={setProfile}
              criteria={criteria}
              setCriteria={setCriteria}
              submissions={submissions}
              setSubmissions={setSubmissions}
              evaluationResult={evaluationResult}
              events={events}
              confessions={confessions}
              setConfessions={setConfessions}
              scholarships={scholarships}
            />
          ) : (
            <AdminView
              submissions={submissions}
              setSubmissions={setSubmissions}
              events={events}
              setEvents={setEvents}
              users={users}
              setUsers={setUsers}
              currentUser={users.find(u => u.id === authUser?.id) || null}
              scholarships={scholarships}
              setScholarships={setScholarships}
            />
          )}
        </div>

        <Footer />
      </div>
    </NotificationProvider>
  );
}

export default App;
