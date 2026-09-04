import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AdminDashboard } from './components/AdminDashboard';
import { HeroSearch } from './components/HeroSearch';
import { Footer } from './components/Footer';
import './App.css';

type ViewMode = 'home' | 'login' | 'register' | 'admin';

function AppContent() {
  const [activeView, setActiveView] = useState<ViewMode>('home');

  return (
    <div className="app-wrapper">
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      <main style={{ flex: 1 }}>
        {activeView === 'home' && <HeroSearch />}

        {activeView === 'login' && (
          <LoginPage
            onSuccess={(role) => {
              if (role === 'admin') {
                setActiveView('admin');
              } else {
                setActiveView('home');
              }
            }}
            onNavigateToRegister={() => setActiveView('register')}
          />
        )}

        {activeView === 'register' && (
          <RegisterPage
            onSuccess={() => setActiveView('home')}
            onNavigateToLogin={() => setActiveView('login')}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard onBackToHome={() => setActiveView('home')} />
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
