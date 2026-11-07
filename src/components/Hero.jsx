import { useEffect, useState } from 'react';
import { CV_URL, STATS } from '../data.js';
import { useInView } from '../hooks/useReveal.js';
import { T, useLang } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';

const HERO_GLYPHS = { v1: './dev', v2: '<ai/>', v3: '~root' };

function Counter({ target, start }) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!start || target === 0) return undefined;
    const duration = 1200;
    const t0 = performance.now();
    let frame;
    const update = (now) => {
      const progress = Math.min((now - t0) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(progress < 1 ? Math.floor(target * eased) : target);
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);

  return <span className="counter">{value}</span>;
}

function StatStrip() {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`stat-strip reveal${visible ? ' in' : ''}`}>
      {STATS.map((s) => (
        <div className="cell" key={s.key}>
          <div className="num">
            {s.prefix && <span className="unit">{s.prefix}</span>}
            <Counter target={s.target} start={visible} />
            <span className="unit">{s.unit}</span>
          </div>
          <T className="label" as="div" k={s.key} />
        </div>
      ))}
    </div>
  );
}

function AvatarSvg() {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="gradA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#333" />
          <stop offset="1" stopColor="#0a0a0a" />
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#888" />
        </pattern>
      </defs>
      <g stroke="#2a2a2a" strokeWidth="0.5">
        {[100, 200, 300].map((p) => (
          <g key={p}>
            <line x1="0" y1={p} x2="400" y2={p} />
            <line x1={p} y1="0" x2={p} y2="400" />
          </g>
        ))}
      </g>
      <g transform="translate(200,200)">
        <circle r="120" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite" />
        </circle>
        <circle r="90" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <polygon points="0,-90 78,45 -78,45" fill="none" stroke="currentColor" strokeWidth="1.5">
          <animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="40s" repeatCount="indefinite" />
        </polygon>
        <polygon points="0,-60 52,30 -52,30" fill="url(#dots)" stroke="currentColor" strokeWidth="1" />
        <circle r="30" fill="#0a0a0a" stroke="currentColor" strokeWidth="1.5" />
        <text y="6" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="18" fontWeight="600" fill="currentColor">
          RSV
        </text>
      </g>
      <g stroke="currentColor" strokeWidth="1.5" fill="none">
        <path d="M 20,20 L 20,40 L 40,40" />
        <path d="M 380,20 L 380,40 L 360,40" />
        <path d="M 20,380 L 20,360 L 40,360" />
        <path d="M 380,380 L 380,360 L 360,360" />
      </g>
      <line x1="0" y1="50" x2="400" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="y1" values="0;400;0" dur="8s" repeatCount="indefinite" />
        <animate attributeName="y2" values="0;400;0" dur="8s" repeatCount="indefinite" />
      </line>
    </svg>
  );
}

export default function Hero({ heroGlyph }) {
  const { t } = useLang();
  return (
    <section className="hero" id="top">
      <div className="hero-grid">
        <div>
          <Reveal className="hero-meta">
            <span className="pulse" />
            <T k="hero_status" />
            <T className="tag accent" k="hero_role" />
            <span className="tag">LARAVEL • AWS</span>
          </Reveal>
          <Reveal as="h1" className="hero-title">
            <span className="line">Renan</span>
            <span className="line">Skonicezny</span>
            <span className="line muted">
              Vilela <span className="glyph">{HERO_GLYPHS[heroGlyph] ?? HERO_GLYPHS.v1}</span>
            </span>
          </Reveal>
          <Reveal as="p" className="hero-sub" dangerouslySetInnerHTML={{ __html: t('hero_sub') }} />
          <Reveal className="hero-actions">
            <T as="a" className="btn primary" href="#contact" k="hero_cta1" />
            <T as="a" className="btn" href={CV_URL} download k="hero_cta2" />
          </Reveal>
        </div>

        <Reveal className="avatar-wrap">
          <AvatarSvg />
          <div className="avatar-label">
            <span>ID: RSV-2026</span>
            <span>v4.2.0</span>
          </div>
        </Reveal>
      </div>
      <StatStrip />
    </section>
  );
}
