import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from './lib/store';
import TabBar from './components/TabBar';
import Mascot from './components/Mascot';
import Onboarding from './screens/Onboarding';
import Learn from './screens/Learn';
import Lesson from './screens/Lesson';
import Practice, { PracticeSession } from './screens/Practice';
import { TestIntro, TestRun } from './screens/MockTest';
import Signs from './screens/Signs';
import Profile from './screens/Profile';
import About from './screens/About';

export default function App() {
  const { ready, init, settings } = useStore();
  const loc = useLocation();
  useEffect(() => { void init(); }, [init]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.dark);
    document.documentElement.classList.toggle('large', settings.largeText);
    document.documentElement.lang = settings.lang;
  }, [settings.dark, settings.largeText, settings.lang]);

  if (!ready) return <div className="flex h-full items-center justify-center"><Mascot size={96} /></div>;
  if (!settings.onboarded) return <Onboarding />;

  const hideTabs = /^\/(lesson|practice\/session|test\/run)/.test(loc.pathname) || loc.pathname === '/onboarding';
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<Learn />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/session" element={<PracticeSession />} />
        <Route path="/test" element={<TestIntro />} />
        <Route path="/test/run" element={<TestRun />} />
        <Route path="/signs" element={<Signs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideTabs && <TabBar />}
    </div>
  );
}
