import React, { useState } from 'react';
import { ArrowRight, BookOpen, Award, Users, Zap, Shield, Target, TrendingUp, CheckCircle, Star } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-700/30 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Award className="text-white" size={28} />
            </div>
            <div>
              <div className="text-white font-black text-xl">Sinh Viên 5 Tốt</div>
              <div className="text-xs text-blue-300">Management System</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Tính năng</a>
            <a href="#howitworks" className="text-slate-300 hover:text-white transition-colors">Cách hoạt động</a>
            <a href="#benefits" className="text-slate-300 hover:text-white transition-colors">Lợi ích</a>
          </div>
        </div>
      </nav>

      {/* Hero Section with Illustration */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300 text-sm font-semibold">
                  ✨ Nền tảng Quản lý Toàn diện
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                Trở thành <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">Sinh Viên 5 Tốt</span>
              </h1>
              <p className="text-xl text-slate-300 font-light max-w-2xl">
                Nền tảng quản lý và đánh giá toàn diện cho tiêu chuẩn Sinh viên 5 Tốt: Đạo đức, Học tập, Sức khỏe, Tình nguyện & Hội nhập
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle size={20} className="text-green-400" />
                <span>Đánh giá toàn diện</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle size={20} className="text-green-400" />
                <span>Khuyến nghị cá nhân</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle size={20} className="text-green-400" />
                <span>Theo dõi tiến độ</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 text-white font-bold rounded-xl text-lg shadow-2xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-cyan-500/70 hover:scale-105 transition-all flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Bắt đầu đánh giá ngay
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
              </button>
              <a
                href="#features"
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700 text-white font-bold rounded-xl text-lg border border-slate-600 transition-all w-full sm:w-auto text-center"
              >
                Tìm hiểu thêm
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-700/50">
              <div className="space-y-1">
                <div className="text-2xl font-black text-cyan-400">5</div>
                <p className="text-sm text-slate-400">Tiêu chí đánh giá</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-cyan-400">100%</div>
                <p className="text-sm text-slate-400">An toàn dữ liệu</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-cyan-400">24/7</div>
                <p className="text-sm text-slate-400">Hỗ trợ trực tuyến</p>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200 hidden md:block">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl blur-3xl"></div>
              
              {/* Main illustration box */}
              <div className="relative bg-gradient-to-br from-slate-800/50 to-blue-900/50 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  {/* Card 1 */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-4 hover:border-blue-500/60 transition-all">
                    <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="text-blue-400" size={22} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Đạo Đức</div>
                      <div className="text-xs text-slate-400 mt-1">Hành vi văn minh</div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-4 hover:border-cyan-500/60 transition-all">
                    <div className="w-10 h-10 bg-cyan-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="text-cyan-400" size={22} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Học Tập</div>
                      <div className="text-xs text-slate-400 mt-1">Kết quả học tập</div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-4 hover:border-emerald-500/60 transition-all">
                    <div className="w-10 h-10 bg-emerald-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="text-emerald-400" size={22} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Sức Khỏe</div>
                      <div className="text-xs text-slate-400 mt-1">Thể chất và tinh thần</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="pt-4 border-t border-slate-700/30">
                    <div className="text-xs text-slate-400 mb-2">Mức độ hoàn thiện: 65%</div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce">
                Pro Max ✨
              </div>
              <div className="absolute -bottom-6 -left-6 bg-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                v1.0 Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white">Tính năng chính</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Hỗ trợ toàn diện cho hành trình trở thành Sinh viên 5 Tốt</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                id: 'assess',
                icon: <BookOpen size={40} />,
                title: 'Đánh giá Toàn Diện',
                description: 'Kiểm tra chi tiết 5 tiêu chí: Đạo đức, Học tập, Sức khỏe, Tình nguyện, Hội nhập',
                color: 'from-blue-500/30 to-blue-600/30 border-blue-500/60'
              },
              {
                id: 'recommend',
                icon: <Zap size={40} />,
                title: 'Khuyến Nghị Cá Nhân',
                description: 'Nhận gợi ý cụ thể dựa trên hồ sơ để hoàn thiện từng tiêu chí',
                color: 'from-cyan-500/30 to-cyan-600/30 border-cyan-500/60'
              },
              {
                id: 'track',
                icon: <TrendingUp size={40} />,
                title: 'Theo Dõi Tiến Độ',
                description: 'Lưu trữ minh chứng, theo dõi trạng thái duyệt, quản lý hồ sơ hiệu quả',
                color: 'from-emerald-500/30 to-emerald-600/30 border-emerald-500/60'
              },
              {
                id: 'events',
                icon: <Users size={40} />,
                title: 'Sự Kiện Hỗ Trợ',
                description: 'Khám phá hoạt động, workshop, sự kiện phù hợp với tiêu chí của bạn',
                color: 'from-violet-500/30 to-violet-600/30 border-violet-500/60'
              },
              {
                id: 'security',
                icon: <Shield size={40} />,
                title: 'Bảo Mật Dữ Liệu',
                description: 'Thông tin bảo vệ với authentication, authorization tiêu chuẩn, mã hóa mạnh',
                color: 'from-orange-500/30 to-orange-600/30 border-orange-500/60'
              },
              {
                id: 'admin',
                icon: <Award size={40} />,
                title: 'Quản Trị Hệ Thống',
                description: 'Công cụ quản lý sinh viên, duyệt minh chứng, phân tích dữ liệu cho cán bộ',
                color: 'from-pink-500/30 to-pink-600/30 border-pink-500/60'
              }
            ].map((feature) => (
              <div
                key={feature.id}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
                  hoveredFeature === feature.id
                    ? `bg-gradient-to-br ${feature.color} shadow-2xl shadow-blue-500/30 scale-105`
                    : `bg-slate-800/40 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60`
                }`}
              >
                <div className="p-8 space-y-4">
                  <div className={`text-5xl transition-transform duration-300 ${hoveredFeature === feature.id ? 'scale-110 text-white' : 'text-blue-400'}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                  
                  {hoveredFeature === feature.id && (
                    <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm pt-2">
                      Khám phá <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
                
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="howitworks" className="max-w-7xl mx-auto px-6 py-24">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white">Cách hoạt động</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Ba bước đơn giản để bắt đầu hành trình của bạn</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Đăng Ký & Nhập Thông Tin',
                description: 'Tạo tài khoản với MSSV 10 chữ số, cung cấp thông tin cá nhân cơ bản như tên, lớp, khoa.',
                icon: <BookOpen size={32} />,
                color: 'from-blue-500 to-cyan-500'
              },
              {
                number: '02',
                title: 'Tự Đánh Giá 5 Tiêu Chí',
                description: 'Trả lời các câu hỏi chi tiết về Đạo đức, Học tập, Sức khỏe, Tình nguyện, Hội nhập.',
                icon: <Target size={32} />,
                color: 'from-cyan-500 to-emerald-500'
              },
              {
                number: '03',
                title: 'Nhận Khuyến Nghị & Hoàn Thiện',
                description: 'Lập kế hoạch cải thiện dựa trên khuyến nghị cá nhân hóa và tham gia các sự kiện hỗ trợ.',
                icon: <Star size={32} />,
                color: 'from-emerald-500 to-blue-500'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connection line for desktop */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-20 -right-8 w-16 h-1 bg-gradient-to-r from-blue-500 to-transparent group-hover:from-cyan-400"></div>
                )}

                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 space-y-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform`}>
                      <span className="text-3xl font-black text-white">{step.number}</span>
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="text-3xl text-blue-400">{step.icon}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-700/30 flex items-center gap-2 text-blue-400 font-semibold">
                    <CheckCircle size={18} />
                    <span>Dễ dàng & Nhanh chóng</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Summary */}
          <div className="bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-8 text-center">
            <p className="text-slate-300 text-lg">
              <span className="text-cyan-400 font-bold">Thời gian</span> để hoàn thành: <span className="text-white font-bold">~15-20 phút</span> cho đánh giá ban đầu
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="max-w-7xl mx-auto px-6 py-24 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/50">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white">Tại sao chọn chúng tôi?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Những lợi ích vượt trội dành cho sinh viên và cán bộ quản lý</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: '⚡ Nhanh chóng & Hiệu quả',
                items: ['Hoàn thành đánh giá trong 15-20 phút', 'Nhận kết quả tức thì', 'Khuyến nghị tùy chỉnh từng sinh viên']
              },
              {
                title: '🔒 Bảo mật tối ưu',
                items: ['Mã hóa dữ liệu end-to-end', 'Xác thực MSSV 10 chữ số', 'Tuân thủ tiêu chuẩn an toàn dữ liệu']
              },
              {
                title: '📊 Quản lý thông minh',
                items: ['Bảng điều khiển quản lý toàn diện', 'Phân tích dữ liệu chi tiết', 'Xuất báo cáo dễ dàng']
              },
              {
                title: '🎯 Hỗ trợ toàn diện',
                items: ['Sự kiện liên quan được đề xuất', 'Hướng dẫn từng bước cụ thể', 'Cộng đồng sinh viên tích cực']
              }
            ].map((benefit, idx) => (
              <div key={idx} className="group bg-gradient-to-br from-slate-800/50 to-blue-900/30 border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10">
                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors">{benefit.title}</h3>
                <ul className="space-y-4">
                  {benefit.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-300 group-hover:text-white transition-colors">
                      <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-cyan-600/20 to-blue-600/30"></div>
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          
          {/* Content */}
          <div className="relative p-12 md:p-16 text-center space-y-8 border border-blue-500/30 rounded-3xl">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Sẵn sàng trở thành <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sinh viên 5 Tốt</span>?
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Bắt đầu đánh giá ngay hôm nay. Chỉ mất 15-20 phút để khám phá con đường của bạn hướng tới đạo đức, học tập, sức khỏe, tình nguyện và hội nhập toàn diện.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-10 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 text-white font-bold rounded-xl text-lg shadow-2xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-cyan-500/70 hover:scale-105 transition-all flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Bắt đầu ngay
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
              </button>
              <a
                href="#features"
                className="px-10 py-4 bg-slate-800/50 hover:bg-slate-700 text-white font-bold rounded-xl text-lg border border-slate-600 transition-all w-full sm:w-auto text-center"
              >
                Xem thêm chi tiết
              </a>
            </div>

            {/* Bottom note */}
            <div className="pt-8 border-t border-blue-500/20">
              <p className="text-sm text-slate-400">
                ✨ Miễn phí • Bảo mật 100% • Hỗ trợ 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 bg-gradient-to-b from-slate-950 to-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Award className="text-white" size={24} />
                </div>
                <span className="text-white font-bold text-lg">SV5T</span>
              </div>
              <p className="text-sm text-slate-400">Nền tảng quản lý Sinh viên 5 Tốt</p>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-white">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Giá cả</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Hướng dẫn</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="font-bold text-white">Công ty</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Liên hệ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="font-bold text-white">Pháp lý</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Điều khoản</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Riêng tư</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700/50 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <p className="text-slate-400 text-sm">
                © 2025 <span className="font-bold text-white">Sinh Viên 5 Tốt</span>. Tất cả quyền được bảo lưu.
              </p>
              <p className="text-slate-500 text-xs">
                Xây dựng với ❤️ để hỗ trợ hành trình phát triển toàn diện của sinh viên
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
