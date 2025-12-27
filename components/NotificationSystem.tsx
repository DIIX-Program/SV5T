import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// --- Types ---

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string; // Optional link to redirect user
}

interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

// --- Context ---

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// --- Component ---

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);

    // Auto dismiss after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);

    // Attempt Browser Native Notification if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, { body: notification.message });
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Request Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`pointer-events-auto transform transition-all duration-300 ease-in-out translate-y-0 opacity-100 flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 bg-white ${notification.type === 'info' ? 'border-blue-500' :
              notification.type === 'success' ? 'border-green-500' :
                notification.type === 'warning' ? 'border-yellow-500' :
                  'border-red-500'
              }`}
          >
            <div className="flex-shrink-0 pt-0.5">
              {notification.type === 'info' && <Info className="text-blue-500" size={20} />}
              {notification.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
              {notification.type === 'warning' && <AlertTriangle className="text-yellow-500" size={20} />}
              {notification.type === 'error' && <AlertTriangle className="text-red-500" size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-800">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              {notification.link && (
                <a
                  href={notification.link}
                  className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block"
                >
                  Xem chi tiết &rarr;
                </a>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// --- Logic Hook for Auto-Checking ---

export const useNotificationLogic = () => {
  const { addNotification } = useNotifications();

  // Logic kiểm tra hạn nộp hồ sơ dựa trên năm học (1/8 năm nay -> 1/8 năm sau)
  useEffect(() => {
    const checkDeadline = () => {
      const today = new Date();
      const currentYear = today.getFullYear();

      // Xác định Deadline: 1/8 của năm kết thúc chu kỳ
      // Nếu hiện tại < 1/8: Deadline là 1/8 năm nay (kết thúc chu kỳ trước? - Không, user bảo 1/8 năm nay -> 1/8 năm sau)
      // User ví dụ: Hiện tại 2025, thì tính từ 1/8/2025 -> 1/8/2026.
      // Tức là deadline cho kỳ xét 2025-2026 sẽ là 1/8/2026.

      // Logic xác định năm kết thúc (Target Year):
      // Nếu hôm nay >= 1/8/2025 -> Target Deadline là 1/8/2026.
      // Nếu hôm nay < 1/8/2025 -> Target Deadline là 1/8/2025 (cho kỳ 2024-2025).

      let targetYear = currentYear;
      // Kiểm tra xem đã qua ngày 1/8 chưa
      const startOfCycle = new Date(currentYear, 7, 1); // Tháng 8 là index 7
      if (today >= startOfCycle) {
        targetYear = currentYear + 1;
      }

      const deadlineDate = new Date(targetYear, 7, 1); // 1/8 của targetYear

      // Tính số ngày còn lại
      const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Chỉ thông báo nếu còn dưới 30 ngày (hoặc mock demo luôn hiển thị để user thấy)
      // DEMO: Luôn hiện thông báo tính toán đúng ngày
      setTimeout(() => {
        addNotification({
          type: 'warning',
          title: 'Nhắc nhở hạn nộp hồ sơ SV5T',
          message: `Năm học xét duyệt hiện tại sẽ kết thúc vào ngày 01/08/${targetYear}. Bạn còn ${diffDays} ngày để hoàn thành các tiêu chí.`,
        });
      }, 3000);
    };

    const checkScholarships = () => {
      setTimeout(() => {
        addNotification({
          type: 'info',
          title: 'Cập nhật Học bổng SV5T',
          message: 'Học bổng Odon Vallet và Lawrence S. Ting 2025 đang mở đơn cho sinh viên đạt danh hiệu SV5T cấp trường trở lên.',
          link: '#'
        });
      }, 8000);
    };

    checkDeadline();
    checkScholarships();

  }, [addNotification]);
};
