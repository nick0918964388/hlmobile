import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  title: string;
  path: string;
  onClick?: () => void;
  icon?: string;
  shortTitle?: string;
  requiredPermission?: string;
}

export default function Sidebar() {
  const { language } = useLanguage();
  const router = useRouter();
  const { user, loading } = useUser();
  const { hasPermission } = usePermissions();
  const [userGroups, setUserGroups] = useState<string[]>([]);

  // 如果用戶信息加載完成且有用戶數據，設置用戶的群組
  useEffect(() => {
    if (user && user.groups) {
      setUserGroups(user.groups);
    }
  }, [user]);

  const handleLogout = () => {
    // 移除登入狀態
    localStorage.removeItem('isLoggedIn');
    // 導航到登入頁面
    router.push('/');
  };
  
  const menuItems: MenuItem[] = [
    { id: '1', title: 'PM (Preventive Maintenance)', shortTitle: 'PM', path: '/pm', requiredPermission: 'pm.access' },
    { id: '2', title: 'CM (Correction Maintenance)', shortTitle: 'CM', path: '/cm', requiredPermission: 'cm.access' },
    { id: '3', title: 'Debug', path: '/debug' },
    { id: '4', title: 'Admin', path: '/admin/health', requiredPermission: 'admin.access' },
    { id: '5', title: 'Language Settings', path: '/settings' },
    { id: '6', title: 'Logout', path: '#', onClick: handleLogout },
  ];
  
  // 過濾菜單項，只顯示用戶有權限的菜單項
  const filteredMenuItems = menuItems.filter(item => {
    // 如果沒有指定權限要求，或者用戶具有該權限，則顯示
    return !item.requiredPermission || hasPermission(item.requiredPermission);
  });

  // 獲取用戶姓名首字母作為頭像文字
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // 根據用戶名生成唯一顏色
  const getAvatarColor = (name: string): string => {
    if (!name) return 'bg-blue-600';
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-red-600',
      'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600'
    ];
    const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // 載入中狀態
  if (loading) {
    return (
      <div className="w-full h-full bg-gray-800 text-white">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full bg-gray-800 text-white">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {/* 使用文字頭像，避免圖片載入問題 */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user ? getAvatarColor(user.name) : 'bg-gray-600'}`}>
            <span className="text-white text-lg font-semibold">
              {user ? getInitials(user.name) : 'U'}
            </span>
          </div>
          <div>
            <div className="font-semibold text-base">{user?.name || 'User'}</div>
            <div className="text-sm text-gray-400">{user?.role || 'Guest'}</div>
          </div>
        </div>
        
        {/* 顯示用戶群組 */}
        {userGroups.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Groups:</div>
            <div className="flex flex-wrap gap-1">
              {userGroups.map((group, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300">
                  {group}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <nav className="mt-4">
        {filteredMenuItems.map((item) => (
          item.onClick ? (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-full text-left flex items-center px-5 py-3 text-gray-300 hover:bg-gray-700 hover:text-white text-base"
            >
              {item.title}
            </button>
          ) : (
            <Link
              key={item.id}
              href={item.path}
              className="flex items-center px-5 py-3 text-gray-300 hover:bg-gray-700 hover:text-white text-base"
            >
              {item.title}
            </Link>
          )
        ))}
      </nav>
    </div>
  );
} 