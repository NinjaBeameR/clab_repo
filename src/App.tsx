import { useState, useEffect } from 'react';
import { Monitor, List, Edit, LogOut } from 'lucide-react';
import Login from './components/Login';
import ListTab from './components/ListTab';
import ModifyTab from './components/ModifyTab';

type Tab = 'list' | 'modify';

// Hardcoded credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('list');

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Monitor className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hongirana School Of Excellence</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Admin Dashboard</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'list'
                    ? 'bg-blue-600 text-white font-medium shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <List size={18} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setActiveTab('modify')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'modify'
                    ? 'bg-blue-600 text-white font-medium shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Edit size={18} />
                <span className="hidden sm:inline">Modify</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors ml-2"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'list' && <ListTab />}
        {activeTab === 'modify' && <ModifyTab />}
      </main>
    </div>
  );
}

export default App;
