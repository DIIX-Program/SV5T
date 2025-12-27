import React, { useState } from 'react';
import { X, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: any) => void;
  mode: 'login' | 'register' | 'admin';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, mode: initialMode }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form states
  const [mssv, setMssv] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [studentType, setStudentType] = useState('UNIVERSITY');

  const resetForm = () => {
    setMssv('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setClassName('');
    setFaculty('');
    setStudentType('UNIVERSITY');
    setError('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateMSSV = (value: string): boolean => {
    return /^\d{10}$/.test(value);
  };

  const validatePassword = (value: string): boolean => {
    return value.length >= 6;
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    if (!validateMSSV(mssv)) {
      setError('MSSV phải có 10 chữ số');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'admin' ? `${API_BASE_URL}/auth/admin/login` : `${API_BASE_URL}/auth/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mssv, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Đăng nhập thất bại');
        return;
      }

      localStorage.setItem('sv5t_token', data.token);
      localStorage.setItem('sv5t_user', JSON.stringify(data.user));
      
      onLoginSuccess(data.token, data.user);
      handleClose();
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    if (!validateMSSV(mssv)) {
      setError('MSSV phải có 10 chữ số');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError('Vui lòng nhập họ tên');
      setLoading(false);
      return;
    }

    if (!className.trim()) {
      setError('Vui lòng nhập lớp');
      setLoading(false);
      return;
    }

    if (!faculty.trim()) {
      setError('Vui lòng nhập khoa');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mssv,
          password,
          name,
          className,
          faculty,
          studentType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Đăng ký thất bại');
        return;
      }

      localStorage.setItem('sv5t_token', data.token);
      localStorage.setItem('sv5t_user', JSON.stringify(data.user));
      
      onLoginSuccess(data.token, data.user);
      handleClose();
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === 'admin' ? 'Quản Trị Viên' : mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top duration-300">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* MSSV Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              MSSV
            </label>
            <input
              type="text"
              value={mssv}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setMssv(val);
              }}
              placeholder="Nhập 10 chữ số"
              maxLength={10}
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
            {mssv && !validateMSSV(mssv) && (
              <p className="text-xs text-red-600 mt-1">MSSV phải có 10 chữ số</p>
            )}
          </div>

          {/* Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Họ Tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ tên"
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>
          )}

          {/* Class (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lớp
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Ví dụ: CNTT-K65"
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>
          )}

          {/* Faculty (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Khoa
              </label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="Nhập tên khoa"
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>
          )}

          {/* Student Type (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Loại Sinh Viên
              </label>
              <select
                value={studentType}
                onChange={(e) => setStudentType(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              >
                <option value="UNIVERSITY">Đại Học</option>
                <option value="COLLEGE">Cao Đẳng</option>
              </select>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mật Khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={loading}
                className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && !validatePassword(password) && (
              <p className="text-xs text-red-600 mt-1">Mật khẩu ít nhất 6 ký tự</p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  disabled={loading}
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={loading}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 space-y-3">
          <button
            onClick={mode === 'register' ? handleRegister : handleLogin}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            {mode === 'register' ? 'Đăng Ký' : 'Đăng Nhập'}
          </button>

          {mode !== 'admin' && (
            <button
              onClick={() => {
                resetForm();
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              disabled={loading}
              className="w-full px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
            >
              {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
