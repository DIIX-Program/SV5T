
import React from 'react';
import { ShieldCheck, Mail, Phone, Info } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="text-blue-500" size={24} />
            <span className="font-bold text-lg tracking-tight uppercase">SV5T READINESS</span>
          </div>
          <p className="text-sm leading-relaxed">
            Hệ thống hỗ trợ sinh viên tự đánh giá và chuẩn bị hồ sơ đạt danh hiệu "Sinh viên 5 Tốt" cấp Trường. 
            Phát triển bởi DIIX
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-bold uppercase text-xs tracking-widest">Liên hệ hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-blue-500" />
              diixprogramseven@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-blue-500" />
              (022) 22.222.222 - DIIX
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-bold uppercase text-xs tracking-widest">Lưu ý pháp lý</h4>
          <div className="flex gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <Info size={18} className="text-amber-500 shrink-0" />
            <p className="text-[11px] leading-tight italic">
              Hệ thống này chỉ mang tính định hướng. Kết quả cuối cùng phụ thuộc hoàn toàn vào Hội đồng xét duyệt các cấp 
              theo quy định của Trung ương Hội Sinh viên Việt Nam.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
        © {new Date().getFullYear()} Hội Sinh viên Việt Nam - Đơn vị DIIX. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
