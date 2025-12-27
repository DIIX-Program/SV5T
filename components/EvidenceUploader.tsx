
import React, { useState } from 'react';
import { EvidenceSubmission, EvidenceStatus, EvidenceFile } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { Upload, FileText, Check, Clock, X, Paperclip, Plus } from 'lucide-react';

interface Props {
  submissions: EvidenceSubmission[];
  setSubmissions: (s: EvidenceSubmission[]) => void;
  userId: string;
}

const EvidenceUploader: React.FC<Props> = ({ submissions, setSubmissions, userId }) => {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [achievementDate, setAchievementDate] = useState('');
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: EvidenceFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: event.target?.result as string,
          type: file.type
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddFile = () => {
    fileInputRef.current?.click();
  };

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleSubmit = () => {
    if (selectedCats.length === 0 || !description || !achievementDate) {
      alert("Vui lòng nhập đầy đủ thông tin và chọn ít nhất 1 tiêu chí.");
      return;
    }

    const newSubmission: EvidenceSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      criteriaKeys: selectedCats,
      description,
      achievementDate,
      files,
      status: EvidenceStatus.PENDING,
      submittedAt: new Date().toLocaleDateString('vi-VN')
    };

    setSubmissions([newSubmission, ...submissions]);
    // Reset form
    setSelectedCats([]);
    setDescription('');
    setAchievementDate('');
    setFiles([]);
    setIsFormOpen(false);
  };

  const userSubmissions = submissions.filter(s => s.userId === userId);

  return (
    <div className="space-y-8">
      {/* Nút mở Form */}
      {!isFormOpen && (
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full py-6 border-2 border-dashed border-slate-300 rounded-3xl text-slate-500 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
        >
          <Plus size={32} />
          NỘP THÀNH TÍCH / MINH CHỨNG MỚI
        </button>
      )}

      {/* Form nộp phức hợp */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 shadow-xl shadow-blue-50 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg text-slate-800">Tạo hồ sơ minh chứng</h4>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Chọn nhiều tiêu chí */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Tiêu chí liên quan (Chọn 1 hoặc nhiều)</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => toggleCategory(k)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedCats.includes(k) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Thời gian đạt thành tích</label>
                <input 
                  type="date"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  value={achievementDate}
                  onChange={e => setAchievementDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mô tả ngắn thành tích</label>
                <input 
                  placeholder="Ví dụ: Đạt giải Nhất SV Nghiên cứu khoa học" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Quản lý nhiều file */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tệp đính kèm ({files.length})</label>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="space-y-2 mb-4">
                {files.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText size={16} className="text-blue-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-600 truncate">{f.name}</span>
                    </div>
                    <button onClick={() => setFiles(files.filter(file => file.id !== f.id))} className="text-rose-400 hover:text-rose-600 shrink-0 ml-2">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddFile}
                className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-50"
              >
                <Upload size={14} /> Chọn tệp từ máy
              </button>
            </div>

            <button 
              onClick={handleSubmit}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Upload size={18} /> GỬI MINH CHỨNG
            </button>
          </div>
        </div>
      )}

      {/* Danh sách minh chứng đã nộp */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-black text-slate-800 text-lg uppercase tracking-tight">Lịch sử nộp hồ sơ</h5>
          <span className="text-xs font-bold text-slate-400">{userSubmissions.length} lượt nộp</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {userSubmissions.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {s.criteriaKeys.map(ck => (
                      <span key={ck} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {CATEGORY_LABELS[ck as keyof typeof CATEGORY_LABELS]}
                      </span>
                    ))}
                  </div>
                  <h6 className="font-bold text-slate-800 leading-tight">{s.description}</h6>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                    <span>📅 {s.achievementDate}</span>
                    <span>📎 {s.files.length} tệp</span>
                    <span>🕒 {s.submittedAt}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                    s.status === EvidenceStatus.APPROVED ? 'bg-green-100 text-green-600' : 
                    s.status === EvidenceStatus.REJECTED ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {s.status === EvidenceStatus.PENDING ? 'Chờ duyệt' : (s.status === EvidenceStatus.APPROVED ? 'Đã duyệt' : 'Từ chối')}
                  </span>
                  {s.status === EvidenceStatus.REJECTED && s.adminComment && (
                    <p className="text-[10px] text-rose-500 italic max-w-[200px] text-right">Lý do: {s.adminComment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {userSubmissions.length === 0 && (
             <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
               <FileText size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-sm text-slate-400 italic">Bạn chưa nộp bất kỳ minh chứng nào.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploader;
