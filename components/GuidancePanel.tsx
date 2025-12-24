
import React from 'react';
import { EvaluationResult, EvaluationStatus } from '../types';
import { CRITERIA_LIST } from '../constants';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

interface Props {
  result: EvaluationResult;
}

const GuidancePanel: React.FC<Props> = ({ result }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Lightbulb className="text-amber-500" size={20} />
        Lộ trình cải thiện & Phân tích
      </h3>

      <div className="space-y-4">
        {CRITERIA_LIST.map((criterion) => {
          const catKey = criterion.key as keyof typeof result.categoryResults;
          const cat = result.categoryResults[catKey];
          return (
            <div key={criterion.key} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {criterion.id}
                  </span>
                  <span className="font-semibold text-slate-700 text-sm">
                    {criterion.label}
                  </span>
                </div>
                {cat.isHardPassed ? (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={14} /> ĐẠT
                  </span>
                ) : (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${cat.isAlmostPassed ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50'}`}>
                    <XCircle size={14} /> {cat.isAlmostPassed ? 'GẦN ĐẠT' : 'CHƯA ĐẠT'}
                  </span>
                )}
              </div>

              {!cat.isHardPassed && (
                <div className="pl-4 border-l-2 border-slate-100 space-y-2 mt-2">
                  {cat.hardFails.map((fail, i) => (
                    <p key={i} className="text-xs text-rose-600 flex items-start gap-2 italic">
                      - {fail}
                    </p>
                  ))}
                  {cat.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong>Gợi ý:</strong> {tip}
                    </p>
                  ))}
                </div>
              )}

              {cat.isHardPassed && cat.softBonus === 0 && (
                <p className="text-[11px] text-slate-400 italic pl-4 border-l-2 border-slate-100">
                  Đã đạt tiêu chí cứng. Cần thêm tiêu chí mềm để tăng điểm ưu tiên.
                </p>
              )}

              {cat.isHardPassed && cat.softBonus > 0 && (
                <p className="text-[11px] text-green-600 italic pl-4 border-l-2 border-green-100 font-medium">
                  Hoàn thành xuất sắc với {cat.softBonus}% điểm thưởng thành tích.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {result.overallStatus === EvaluationStatus.ELIGIBLE && result.readinessScore < 100 && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-800 font-medium">
            💡 <strong>Mẹo:</strong> Bạn đã đủ điều kiện xét duyệt. Để nâng cao khả năng đạt danh hiệu cấp cao hơn (Tỉnh/Trung ương), hãy tập trung vào các tiêu chí mềm như <strong>Nghiên cứu khoa học</strong> hoặc <strong>Giao lưu quốc tế</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

export default GuidancePanel;
