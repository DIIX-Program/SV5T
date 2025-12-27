
import React from 'react';
import { EvaluationResult, EvaluationStatus } from '../types';
import { CRITERIA_LIST } from '../constants';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import { Trophy, AlertCircle, Clock } from 'lucide-react';

interface Props {
  result: EvaluationResult;
}

const ResultDashboard: React.FC<Props> = ({ result }) => {
  const chartData = [
    { subject: 'Đạo đức', A: result.categoryResults.ethics.isHardPassed ? 100 : (result.categoryResults.ethics.isAlmostPassed ? 60 : 30) },
    { subject: 'Học tập', A: result.categoryResults.study.isHardPassed ? 100 : (result.categoryResults.study.isAlmostPassed ? 60 : 30) },
    { subject: 'Thể lực', A: result.categoryResults.physical.isHardPassed ? 100 : 30 },
    { subject: 'Tình nguyện', A: result.categoryResults.volunteer.isHardPassed ? 100 : (result.categoryResults.volunteer.isAlmostPassed ? 60 : 30) },
    { subject: 'Hội nhập', A: result.categoryResults.integration.isHardPassed ? 100 : 30 },
  ];

  const getStatusConfig = () => {
    switch(result.overallStatus) {
      case EvaluationStatus.ELIGIBLE:
        return {
          icon: Trophy,
          color: 'text-green-600',
          bg: 'bg-green-100',
          border: 'border-green-200',
          label: 'ĐỦ ĐIỀU KIỆN XÉT',
          desc: 'Chúc mừng! Bạn đã đạt tất cả tiêu chí cứng.'
        };
      case EvaluationStatus.ALMOST_READY:
        return {
          icon: Clock,
          color: 'text-amber-600',
          bg: 'bg-amber-100',
          border: 'border-amber-200',
          label: 'GẦN ĐẠT MỤC TIÊU',
          desc: 'Bạn đang ở rất gần! Chỉ cần hoàn thiện một vài thiếu sót nhỏ.'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-rose-600',
          bg: 'bg-rose-100',
          border: 'border-rose-200',
          label: 'CHƯA ĐỦ ĐIỀU KIỆN',
          desc: 'Hiện tại bạn chưa đáp ứng đủ các tiêu chí bắt buộc.'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className={`p-6 ${config.bg} border-b ${config.border}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center ${config.color}`}>
            <StatusIcon size={32} />
          </div>
          <div>
            <h3 className={`font-bold text-lg leading-tight ${config.color}`}>{config.label}</h3>
            <p className="text-sm text-slate-600 font-medium">{config.desc}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Readiness Meter */}
        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mức độ sẵn sàng</p>
          <div className="text-6xl font-black text-slate-900 mb-2">
            {result.readinessScore}<span className="text-3xl text-slate-400">%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out ${result.overallStatus === EvaluationStatus.ELIGIBLE ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${result.readinessScore}%` }}
            />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
              <Radar
                name="Readiness"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
