
import React from 'react';
import { CriteriaData } from '../types';
import { CRITERIA_LIST } from '../constants';
import { 
  ShieldCheck, 
  BookOpen, 
  Dumbbell, 
  HeartHandshake, 
  Globe 
} from 'lucide-react';

interface Props {
  data: CriteriaData;
  onChange: (data: CriteriaData) => void;
}

const CriteriaForm: React.FC<Props> = ({ data, onChange }) => {
  const toggle = (field: keyof CriteriaData) => {
    onChange({ ...data, [field]: !data[field] });
  };

  const setVal = (field: keyof CriteriaData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const SectionHeader = ({ icon: Icon, title, step }: { icon: any, title: string, step: number }) => (
    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
      <h2 className="font-bold text-slate-800 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">{step}</span>
        <Icon size={20} className="text-blue-600" />
        {title}
      </h2>
    </div>
  );

  const Checkbox = ({ checked, label, onChange }: { checked: boolean, label: string, onChange: () => void }) => (
    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-5 h-5 rounded accent-blue-600" />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Render từ CRITERIA_LIST với ID cố định */}
      {CRITERIA_LIST.map((criterion) => {
        // Map criteria ID to component content
        const iconMap = {
          1: ShieldCheck,
          2: BookOpen,
          3: Dumbbell,
          4: HeartHandshake,
          5: Globe
        };
        
        const Icon = iconMap[criterion.id as keyof typeof iconMap];

        return (
          <div key={criterion.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <SectionHeader icon={Icon} title={criterion.label} step={criterion.id} />
            
            {/* 1. ĐẠO ĐỨC */}
            {criterion.id === 1 && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Điểm rèn luyện</label>
                    <input 
                      type="number" 
                      placeholder="Ví dụ: 95"
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                      value={data.trainingPoints || ''}
                      onChange={(e) => setVal('trainingPoints', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      label="Không vi phạm kỷ luật" 
                      checked={data.noDiscipline} 
                      onChange={() => toggle('noDiscipline')} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Tiêu chí ưu tiên (mềm)</p>
                  <Checkbox label="Thành viên đội tuyển Mác - Lênin / TTHCM (Cấp trường trở lên)" checked={data.marxistMember} onChange={() => toggle('marxistMember')} />
                  <Checkbox label="Thanh niên tiêu biểu / Gương người tốt việc tốt được khen thưởng" checked={data.exemplaryYouth} onChange={() => toggle('exemplaryYouth')} />
                </div>
              </div>
            )}

            {/* 2. HỌC TẬP */}
            {criterion.id === 2 && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Điểm trung bình (GPA)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Ví dụ: 3.5"
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.gpa || ''}
                    onChange={(e) => setVal('gpa', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Tiêu chí mềm (Có ít nhất 1 thành tích)</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Checkbox label="Đề tài NCKH sinh viên đạt loại tốt" checked={data.scientificResearch} onChange={() => toggle('scientificResearch')} />
                    <Checkbox label="Bài báo khoa học đăng tạp chí chuyên ngành" checked={data.journalArticle} onChange={() => toggle('journalArticle')} />
                    <Checkbox label="Tham luận in kỷ yếu hội thảo khoa học" checked={data.conferencePaper} onChange={() => toggle('conferencePaper')} />
                    <Checkbox label="Có sáng chế, sản phẩm sáng tạo được công nhận" checked={data.invention} onChange={() => toggle('invention')} />
                    <Checkbox label="Thành viên đội tuyển học thuật Quốc gia/Quốc tế" checked={data.academicTeamMember} onChange={() => toggle('academicTeamMember')} />
                    <Checkbox label="Đạt giải các cuộc thi học thuật/sáng tạo" checked={data.academicCompetitionAward} onChange={() => toggle('academicCompetitionAward')} />
                  </div>
                </div>
              </div>
            )}

            {/* 3. THỂ LỰC */}
            {criterion.id === 3 && (
              <div className="p-6 space-y-3">
                <Checkbox label="Đạt danh hiệu Sinh viên khỏe (Tỉnh trở lên)" checked={data.isHealthyStudent} onChange={() => toggle('isHealthyStudent')} />
                <Checkbox label="Đạt giải hoạt động thể thao phong trào (Trường trở lên)" checked={data.sportAward} onChange={() => toggle('sportAward')} />
              </div>
            )}

            {/* 4. TÌNH NGUYỆN */}
            {criterion.id === 4 && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Số ngày tình nguyện</label>
                    <input 
                      type="number" 
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                      value={data.volunteerDays || ''}
                      onChange={(e) => setVal('volunteerDays', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center">
                    <Checkbox label="Đã có khen thưởng Tình nguyện (Huyện trở lên)" checked={data.volunteerAward} onChange={() => toggle('volunteerAward')} />
                  </div>
                </div>
                <Checkbox label="Giữ vai trò BTC, Đội trưởng, Nòng cốt hoạt động" checked={data.volunteerLeader} onChange={() => toggle('volunteerLeader')} />
              </div>
            )}

            {/* 5. HỘI NHẬP */}
            {criterion.id === 5 && (
              <div className="p-6 space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tiêu chí cứng (Bắt buộc đủ cả 3)</p>
                <Checkbox label="Hoàn thành khóa kỹ năng HOẶC Khen thưởng Đoàn-Hội (Trường trở lên)" checked={data.skillCourseOrUnionAward} onChange={() => toggle('skillCourseOrUnionAward')} />
                <Checkbox label="Tham gia tích nhất 01 hoạt động hội nhập (Trường trở lên)" checked={data.integrationActivity} onChange={() => toggle('integrationActivity')} />
                <Checkbox label="Ngoại ngữ: Chứng chỉ B1 / GPA ngoại ngữ đạt chuẩn" checked={data.englishB1OrGpa} onChange={() => toggle('englishB1OrGpa')} />
                
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Tiêu chí mềm</p>
                <Checkbox label="Tham gia giao lưu quốc tế" checked={data.internationalExchange} onChange={() => toggle('internationalExchange')} />
                <Checkbox label="Giải cuộc thi Hội nhập/Học thuật bằng tiếng nước ngoài" checked={data.foreignLanguageCompetition} onChange={() => toggle('foreignLanguageCompetition')} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CriteriaForm;
