import { useState, useEffect } from 'react';
import { Clock, Bookmark, Image as ImageIcon, TrendingUp, Settings } from 'lucide-react';
import { useAuth, getAuthToken } from './AuthContext';
import { projectId } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = getAuthToken();
      const endpoint = activeTab === 'history' ? 'history' : 'saved';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0c50a72d/user/${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'history') {
          setHistory(data);
        } else {
          setSaved(data);
        }
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'history', label: 'Lịch sử', icon: Clock },
    { id: 'saved', label: 'Đã lưu', icon: Bookmark },
    { id: 'cards', label: 'Reflection Cards', icon: ImageIcon },
    { id: 'stats', label: 'Thống kê', icon: TrendingUp },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Chào mừng trở lại, {user?.email}!</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {activeTab === 'history' && (
          <HistoryTab history={history} loading={loading} />
        )}
        {activeTab === 'saved' && (
          <SavedTab saved={saved} loading={loading} />
        )}
        {activeTab === 'cards' && <CardsTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function HistoryTab({ history, loading }: any) {
  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Chưa có lịch sử xem phim</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Lịch sử xem gần đây</h2>
      <div className="space-y-3">
        {history.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={item.poster || 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=200'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">{item.title || 'Movie Title'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(item.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavedTab({ saved, loading }: any) {
  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (saved.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Chưa có phim đã lưu</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Phim đã lưu</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {saved.map((item: any) => (
          <div
            key={item.id}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700">
              <ImageWithFallback
                src={item.poster || 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=200'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <h4 className="text-sm line-clamp-2">{item.title || 'Movie Title'}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardsTab() {
  return (
    <div className="text-center py-12">
      <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h2 className="text-xl mb-2">Reflection Cards</h2>
      <p className="text-gray-500 dark:text-gray-400">
        Các thẻ cảm xúc bạn đã tạo sẽ xuất hiện ở đây
      </p>
    </div>
  );
}

function StatsTab() {
  return (
    <div>
      <h2 className="text-xl mb-6">Thống kê của bạn</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-6">
          <div className="text-3xl mb-1">24</div>
          <div className="text-sm opacity-90">Phim đã xem</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-xl p-6">
          <div className="text-3xl mb-1">12</div>
          <div className="text-sm opacity-90">Phim đã lưu</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6">
          <div className="text-3xl mb-1">8</div>
          <div className="text-sm opacity-90">Reflection Cards</div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
        <h3 className="mb-4">Top Vibes của bạn</h3>
        <div className="flex flex-wrap gap-2">
          {['Cozy', 'Nostalgic', 'Heartwarming', 'Hopeful', 'Quiet Romance'].map((vibe, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full"
            >
              {vibe}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="mb-4">Mood Timeline (30 ngày)</h3>
        <div className="h-32 bg-white dark:bg-gray-800 rounded-lg flex items-end space-x-1 p-4">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-4">Cài đặt</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Ngôn ngữ</label>
          <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
            <option>Tiếng Việt</option>
            <option>English</option>
            <option>한국어</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Khu vực</label>
          <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
            <option>Việt Nam</option>
            <option>Korea</option>
            <option>United States</option>
          </select>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="flex items-center space-x-2 mb-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Bật Comfort Guardian mặc định</span>
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-6">
            Tự động lọc nội dung nhạy cảm
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button className="text-red-500 hover:text-red-600">
            Xóa toàn bộ dữ liệu mood
          </button>
        </div>
      </div>
    </div>
  );
}
