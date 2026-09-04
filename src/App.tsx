import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { HeroSearch } from './components/HeroSearch';
import { Footer } from './components/Footer';
import './App.css';

type ViewMode = 'home' | 'login' | 'register' | 'admin' | 'user-dashboard';

function AppContent() {
  const [activeView, setActiveView] = useState<ViewMode>('home');

  return (
    <div className="app-wrapper">
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      <main style={{ flex: 1 }}>
        {activeView === 'home' && (
          <HeroSearch
            onNavigateToDashboard={() => setActiveView('user-dashboard')}
            onNavigateToLogin={() => setActiveView('login')}
          />
        )}

        {activeView === 'login' && (
          <LoginPage
            onSuccess={(role) => {
              if (role === 'admin') {
                setActiveView('admin');
              } else {
                setActiveView('user-dashboard');
              }
            }}
            onNavigateToRegister={() => setActiveView('register')}
          />
        )}

        {activeView === 'register' && (
          <RegisterPage
            onSuccess={() => setActiveView('user-dashboard')}
            onNavigateToLogin={() => setActiveView('login')}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard onBackToHome={() => setActiveView('home')} />
        )}

        {activeView === 'user-dashboard' && (
          <UserDashboard onBackToSearch={() => setActiveView('home')} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
