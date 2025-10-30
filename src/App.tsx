import { useState, useEffect } from 'react';
import { Monitor, LogOut, List, Edit } from 'lucide-react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import ListTab from './components/ListTab';
import ModifyTab from './components/ModifyTab';

type Tab = 'list' | 'modify';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('list');

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
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
                <h1 className="text-xl font-bold text-gray-900">Computer Lab Manager</h1>
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
