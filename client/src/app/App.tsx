import { useState, useEffect } from 'react';
import { MovieCatalog } from '../features/movie/components/MovieCatalog';
import { EmotionalJourney } from '../features/emotion/components/EmotionalJourney';
import { PartyMode } from '../features/movie/components/PartyMode';
import { CharacterMatch } from '../features/emotion/components/CharacterMatch';
import { UserDashboard } from '../features/auth/components/UserDashboard';
import { AuthModal } from '../features/auth/components/AuthModal';
import { AuthProvider, useAuth } from '../features/auth/components/AuthContext';
import { Moon, Sun, Film, Heart, Users, User, UserCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import {AppProviders} from "./Providers";

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
    <AppProviders children={undefined}>
        <AppContent />
    </AppProviders>
  );
}
