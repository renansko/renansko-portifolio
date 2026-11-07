import { useCallback, useEffect, useRef, useState } from 'react';
import CapiBot from './capibot/CapiBot.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Experience from './components/Experience.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Nav from './components/Nav.jsx';
import Projects from './components/Projects.jsx';
import Skills from './components/Skills.jsx';
import TweaksPanel from './components/TweaksPanel.jsx';
import { LangProvider } from './i18n-context.jsx';
import { readStorage, writeStorage } from './storage.js';

// Chave versionada: preferências do visual antigo (cyan/dark) não se aplicam ao novo.
const TWEAKS_KEY = 'tweaks-v2';
const TWEAK_DEFAULTS = { accent: 'grass', theme: 'light', density: 'normal' };

function loadTweaks() {
  try {
    return { ...TWEAK_DEFAULTS, ...JSON.parse(readStorage(TWEAKS_KEY) || '{}') };
  } catch {
    return TWEAK_DEFAULTS;
  }
}

function useToast() {
  const [toast, setToast] = useState({ msg: '', show: false });
  const timer = useRef(null);
  const showToast = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast({ msg, show: true });
    timer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [toast, showToast];
}

export default function App() {
  const [tweaks, setTweaks] = useState(loadTweaks);
  const [toast, showToast] = useToast();

  useEffect(() => {
    // O CSS de tema usa body[data-*], então os tweaks são aplicados no <body>.
    document.body.dataset.accent = tweaks.accent;
    document.body.dataset.theme = tweaks.theme;
    document.body.dataset.density = tweaks.density;
    writeStorage(TWEAKS_KEY, JSON.stringify(tweaks));
  }, [tweaks]);

  const setTweak = useCallback((key, value) => setTweaks((t) => ({ ...t, [key]: value })), []);

  return (
    <LangProvider>
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact onToast={showToast} />
      <div className={`toast-msg${toast.show ? ' show' : ''}`} role="status">
        {toast.msg}
      </div>
      <CapiBot />
      <Footer />
      <TweaksPanel tweaks={tweaks} onChange={setTweak} />
    </LangProvider>
  );
}
