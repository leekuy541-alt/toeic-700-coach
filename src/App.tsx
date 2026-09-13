import { useCallback, useState } from 'react';
import { DEFAULT_STATE, type AppState, type Page } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Home from './pages/Home';
import Part5Quiz from './pages/Part5Quiz';
import Vocab from './pages/Vocab';
import TodayStudy from './pages/TodayStudy';
import PartsGuide from './pages/PartsGuide';
import Listening from './pages/Listening';
import './App.css';

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'today', label: '오늘', icon: '📅' },
  { id: 'listening', label: '듣기', icon: '🎧' },
  { id: 'part5', label: 'Part5', icon: '✏️' },
  { id: 'vocab', label: '단어', icon: '📚' },
  { id: 'guide', label: '가이드', icon: '🗺️' },
];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [state, setState] = useLocalStorage<AppState>('toeic700-state', DEFAULT_STATE);

  const go = useCallback((p: Page) => setPage(p), []);

  return (
    <div className="app">
      <main className="main">
        {page === 'home' && <Home state={state} onNavigate={go} />}
        {page === 'listening' && <Listening />}
        {page === 'part5' && <Part5Quiz state={state} setState={setState} />}
        {page === 'vocab' && <Vocab state={state} setState={setState} />}
        {page === 'today' && <TodayStudy state={state} setState={setState} />}
        {page === 'guide' && <PartsGuide />}
      </main>
      <nav className="bottom-nav" aria-label="주요 메뉴">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={page === n.id ? 'nav-item active' : 'nav-item'}
            onClick={() => go(n.id)}
          >
            <span className="nav-icon" aria-hidden>
              {n.icon}
            </span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
