import { useState, useEffect } from 'react';
import { Home, ClipboardList, BarChart3, LogOut } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import QuestionnairePage from './pages/QuestionnairePage';
import DashboardPage from './pages/DashboardPage';
import type { Homeowner, Page } from './types';

const STORAGE_KEY = 'homeowner_current_user';

function saveUser(h: Homeowner) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}
function loadUser(): Homeowner | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch { return null; }
}

export default function App() {
  const [user, setUser] = useState<Homeowner | null>(loadUser);
  const [page, setPage] = useState<Page>('questionnaire');

  useEffect(() => {
    if (!user) setPage('questionnaire');
  }, [user]);

  const handleLogin = (homeowner: Homeowner) => {
    saveUser(homeowner);
    setUser(homeowner);
    setPage('questionnaire');
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm hidden sm:block">דרישות דיירים</span>
            </div>

            {/* Nav tabs */}
            <nav className="flex gap-1 flex-1">
              <button
                onClick={() => setPage('questionnaire')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === 'questionnaire'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">השאלון שלי</span>
                <span className="sm:hidden">שאלון</span>
              </button>
              <button
                onClick={() => setPage('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">דשבורד קהילתי</span>
                <span className="sm:hidden">דשבורד</span>
              </button>
            </nav>

            {/* Current user */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</div>
                <div className="text-xs text-gray-500">דירה {user.apartment}{user.building ? ` · בניין ${user.building}` : ''}</div>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="החלף משתמש"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-3xl mx-auto pt-6">
        {page === 'questionnaire' && (
          <QuestionnairePage
            homeowner={user}
            onGoToDashboard={() => setPage('dashboard')}
          />
        )}
        {page === 'dashboard' && (
          <DashboardPage
            currentUser={user}
            onGoToQuestionnaire={() => setPage('questionnaire')}
          />
        )}
      </main>
    </div>
  );
}
