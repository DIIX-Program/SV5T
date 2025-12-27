import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter
} from 'recharts';
import { TrendingUp, Users, Target, AlertCircle, Database, Download } from 'lucide-react';
import { EvidenceSubmission, EvaluationStatus } from '../types';
import {
  StudentDataRecord, calculateDatasetStatistics, analyzeGPACorrelation,
  clusterStudents, datasetToCSV, generateAnalyticsReport, createStudentDataRecord,
  generateExcelExportName
} from '../services/dataAnalyticsService';

interface Props {
  submissions: EvidenceSubmission[];
}

const AnalyticsDashboard: React.FC<Props> = ({ submissions }) => {
  // Mock: Create dummy dataset from submissions (trong thực tế, pass từ App.tsx)
  const dummyDataset: StudentDataRecord[] = useMemo(() => {
    // Simplified mock for demo - trong production sẽ có real data
    return [];
  }, []);

  // Statistics
  const stats = useMemo(() => calculateDatasetStatistics(dummyDataset), [dummyDataset]);
  const gpaAnalysis = useMemo(() => analyzeGPACorrelation(dummyDataset), [dummyDataset]);
  const clusters = useMemo(() => clusterStudents(dummyDataset), [dummyDataset]);

  // Chart data
  const statusDistribution = [
    { name: 'Đạt', value: stats.eligibleCount, color: '#10b981' },
    { name: 'Gần đạt', value: stats.almostReadyCount, color: '#f59e0b' },
    { name: 'Chưa đạt', value: stats.notEligibleCount, color: '#ef4444' }
  ];

  const criteriaPassRates = [
    { criteria: 'Đạo đức', rate: (stats.hardEthicsRate * 100).toFixed(1) },
    { criteria: 'Học tập', rate: (stats.hardStudyRate * 100).toFixed(1) },
    { criteria: 'Thể lực', rate: (stats.hardPhysicalRate * 100).toFixed(1) },
    { criteria: 'Tình nguyện', rate: (stats.hardVolunteerRate * 100).toFixed(1) },
    { criteria: 'Hội nhập', rate: (stats.hardIntegrationRate * 100).toFixed(1) }
  ];

  const softCriteriaAdoption = [
    { name: 'Đạo đức', adoption: (stats.softEthicsAdoptionRate * 100).toFixed(1) },
    { name: 'Học tập', adoption: (stats.softStudyAdoptionRate * 100).toFixed(1) },
    { name: 'Tình nguyện', adoption: (stats.softVolunteerAdoptionRate * 100).toFixed(1) },
    { name: 'Hội nhập', adoption: (stats.softIntegrationAdoptionRate * 100).toFixed(1) }
  ];

  const gpaDistribution = gpaAnalysis.breakdown.map(b => ({
    gpaRange: b.gpaRange,
    eligibilityRate: (b.eligibilityRate * 100).toFixed(1)
  }));

  const handleExportData = () => {
    const csv = datasetToCSV(dummyDataset);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', generateExcelExportName());
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportReport = () => {
    const report = generateAnalyticsReport(dummyDataset);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `SV5T_Report_${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="text-blue-600" size={28} />
            Phân Tích Dữ Liệu & Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống Data Science để phân tích & dự đoán khả năng đạt Sinh viên 5 Tốt
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-all"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
          >
            <Download size={16} /> Report
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600 font-medium">Tổng Sinh Viên</span>
            <Users className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalStudents}</div>
          <p className="text-xs text-slate-500 mt-2">Records trong hệ thống</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600 font-medium">Tỷ Lệ Đạt</span>
            <Target className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.passRate.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-2">{stats.eligibleCount} sinh viên đạt</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600 font-medium">GPA Trung Bình</span>
            <TrendingUp className="text-amber-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.avgGpa.toFixed(2)}</div>
          <p className="text-xs text-slate-500 mt-2">σ = {stats.gpaStd.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600 font-medium">Hoàn Thành Trung Bình</span>
            <BarChart className="text-purple-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.avgCompletionPercent.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-2">Readiness score</p>
        </div>
      </div>

      {/* MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-blue-600" />
            Phân Bố Trạng Thái
          </h3>
          {dummyDataset.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistribution.map((item, idx) => (
                    <Cell key={`cell-${idx}`} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Chưa có dữ liệu để hiển thị
            </div>
          )}
          <div className="mt-4 space-y-2 text-sm">
            {statusDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-medium text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hard Criteria Pass Rates */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart size={20} className="text-green-600" />
            Tỷ Lệ Đạt Tiêu Chí Cứng
          </h3>
          {dummyDataset.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={criteriaPassRates} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="criteria" type="category" width={70} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="rate" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Chưa có dữ liệu để hiển thị
            </div>
          )}
        </div>
      </div>

      {/* DETAILED ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Soft Criteria Adoption */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Tỷ Lệ Tiêu Chí Mềm</h3>
          {dummyDataset.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={softCriteriaAdoption}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="adoption" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Chưa có dữ liệu để hiển thị
            </div>
          )}
        </div>

        {/* GPA Impact Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Tác Động GPA (Correlation: {gpaAnalysis.correlation.toFixed(2)})</h3>
          {dummyDataset.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gpaDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="gpaRange" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="eligibilityRate" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Chưa có dữ liệu để hiển thị
            </div>
          )}
        </div>
      </div>

      {/* BOTTLENECKS & CLUSTERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bottleneck Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            Điểm Yếu (Bottlenecks)
          </h3>
          <div className="space-y-3">
            {stats.bottlenecks.length > 0 ? (
              stats.bottlenecks.map((b, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">{i + 1}. {b.criteria}</span>
                    <span className="text-sm font-bold text-red-600">{(b.failureRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${b.failureRate * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{b.affectedStudents} sinh viên gặp khó khăn</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Student Clusters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Phân Nhóm Sinh Viên (Clustering)</h3>
          <div className="space-y-3">
            {clusters.length > 0 ? (
              clusters.map((cluster, i) => (
                <div key={cluster.cluster_id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-700">{cluster.profile_name}</h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                      {cluster.student_count} sv ({((cluster.student_count / stats.totalStudents) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-slate-600">GPA Trung bình</p>
                      <p className="font-bold text-slate-900">{cluster.avg_gpa.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Tỷ lệ đạt</p>
                      <p className="font-bold text-green-600">{(cluster.eligibility_rate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">{cluster.characteristics.join(' • ')}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-3">💡 Về Hệ Thống Data Science</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>✓ <strong>Dataset:</strong> Chuyển đổi dữ liệu sinh viên thành feature vectors cho ML</li>
          <li>✓ <strong>Phân tích:</strong> EDA, correlation, clustering để hiểu dữ liệu</li>
          <li>✓ <strong>Dự đoán:</strong> Sử dụng supervised learning để dự đoán khả năng đạt</li>
          <li>✓ <strong>Khuyến nghị:</strong> Gợi ý cải thiện & sự kiện dựa trên predictive models</li>
          <li>✓ <strong>Tối ưu:</strong> Điều chỉnh trọng số tiêu chí dựa trên dữ liệu lịch sử</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
