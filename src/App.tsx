import { useState, useEffect } from 'react';
import { MovieCatalog } from './components/MovieCatalog';
import { EmotionalJourney } from './components/EmotionalJourney';
import { PartyMode } from './components/PartyMode';
import { CharacterMatch } from './components/CharacterMatch';
import { UserDashboard } from './components/UserDashboard';
import { AuthModal } from './components/AuthModal';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Moon, Sun, Film, Heart, Users, User, UserCircle } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'catalog', label: 'Khám Phá Phim', icon: Film },
    { id: 'journey', label: 'Liệu Trình Cảm Xúc', icon: Heart },
    { id: 'party', label: 'Party Mode', icon: Users },
    { id: 'character', label: 'Character Match', icon: UserCircle },
    { id: 'dashboard', label: 'Dashboard', icon: User, protected: true },
  ];

  const handleTabClick = (tabId: string, isProtected: boolean) => {
    if (isProtected && !user) {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">CineMotion</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Điều hướng cảm xúc bằng điện ảnh</p>
              </div>
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.protected || false)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && <MovieCatalog />}
        {activeTab === 'journey' && <EmotionalJourney />}
        {activeTab === 'party' && <PartyMode />}
        {activeTab === 'character' && <CharacterMatch />}
        {activeTab === 'dashboard' && user && <UserDashboard />}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Nếu người dùng chưa từng đổi theme, set dark là mặc định
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-white" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
