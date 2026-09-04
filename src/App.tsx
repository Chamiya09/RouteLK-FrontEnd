import { useState } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { BusResultsModal } from './components/BusResultsModal';

export function App() {
  const [activePage, setActivePage] = useState('home');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    from: 'Colombo',
    to: 'Kandy',
    passengers: 1
  });

  const handleSearch = (from: string, to: string, passengers: number) => {
    setSearchParams({ from, to, passengers });
    setIsSearchModalOpen(true);
  };

  const handleNavigate = (page: string) => {
    setActivePage(page);
    if (page === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="app-wrapper">
      {/* Navigation Bar */}
      <Navbar onNavigate={handleNavigate} activePage={activePage} />

      {/* Main Content Area */}
      <main>
        {/* Hero Section with Search Card */}
        <Hero onSearch={handleSearch} />

        {/* The Problem Section */}
        <ProblemSection />

        {/* How It Works (3 Steps) Section */}
        <HowItWorks />
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Interactive Search Modal */}
      <BusResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        fromCity={searchParams.from}
        toCity={searchParams.to}
        passengers={searchParams.passengers}
      />
    </div>
  );
}

export default App;
