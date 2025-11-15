import { useState, useEffect } from 'react';
import { MovieCatalog } from './components/movies/MovieCatalog';
import { EmotionalJourney } from './components/emotion/EmotionalJourney';
import { PartyMode } from './components/movies/PartyMode';
import { CharacterMatch } from './components/emotion/CharacterMatch';
import { UserDashboard } from './components/auth/UserDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { Moon, Sun, Film, Heart, Users, User, UserCircle } from 'lucide-react';
import Header from './layout/Header';

function AppContent() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <Header
        tab={tabs}
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        setShowAuthModal={setShowAuthModal}
      />

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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
