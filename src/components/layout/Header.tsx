import { useState, useEffect } from 'react';
import { Moon, Sun, Film, Heart, Users, User, UserCircle } from 'lucide-react';
import { useAuth } from "../../features/auth/components/AuthContext"

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

const Header = ({ tab, activeTab, handleTabClick, setShowAuthModal }) => {
    const { user, logout } = useAuth();

    return (
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
                    {tab.map((tabItem) => {
                        const Icon = tabItem.icon;
                        return (
                            <button
                                key={tabItem.id}
                                onClick={() => handleTabClick(tabItem.id, tabItem.protected || false)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === tabItem.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{tabItem.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </header>
    )
}

export default Header