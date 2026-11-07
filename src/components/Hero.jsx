import { useEffect, useState } from 'react';
import { CV_URL, STATS } from '../data.js';
import { useInView } from '../hooks/useReveal.js';
import { T, useLang } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';

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

// Cena original: céu, nuvens, colinas e uma árvore. O ponto focal (árvore) fica
// na interseção do terço direito superior.
function HeroScene() {
  const daisies = [
    [60, 330], [104, 352], [150, 318], [210, 360], [262, 336], [318, 356], [372, 326], [420, 350], [454, 318],
  ];
  return (
    <svg viewBox="0 0 480 400" role="img" aria-label="Ilustração de um campo verde com uma árvore sob o céu azul">
      <circle cx="84" cy="76" r="28" fill="#f5c533" opacity="0.9" />
      <g className="scene-cloud" fill="#ffffff">
        <ellipse cx="120" cy="120" rx="56" ry="24" />
        <ellipse cx="96" cy="108" rx="28" ry="24" />
        <ellipse cx="140" cy="100" rx="32" ry="28" />
      </g>
      <g className="scene-cloud slow" fill="#ffffff" opacity="0.9">
        <ellipse cx="392" cy="72" rx="48" ry="20" />
        <ellipse cx="372" cy="60" rx="24" ry="20" />
        <ellipse cx="408" cy="56" rx="28" ry="24" />
      </g>
      <path d="M0 248 Q 80 192 168 232 T 336 224 T 480 216 L480 400 L0 400 Z" fill="var(--hill-back)" />
      <g transform="translate(320 133)">
        <rect x="-6" y="40" width="12" height="80" rx="4" fill="#6b4a2b" />
        <ellipse cx="0" cy="40" rx="48" ry="28" fill="#2f4a22" />
        <ellipse cx="0" cy="12" rx="40" ry="24" fill="#3d5f2e" />
        <ellipse cx="0" cy="-12" rx="28" ry="20" fill="#4c7a36" />
      </g>
      <path d="M0 296 Q 120 240 240 288 T 480 280 L480 400 L0 400 Z" fill="var(--hill-front)" />
      {daisies.map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <circle r="6" fill="#ffffff" />
          <circle r="2" fill="#f5c533" />
        </g>
      ))}
    </svg>
  );
}

export default function Hero() {
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
            <span className="line muted">Vilela</span>
          </Reveal>
          <Reveal as="p" className="hero-sub" dangerouslySetInnerHTML={{ __html: t('hero_sub') }} />
          <Reveal className="hero-actions">
            <T as="a" className="btn primary" href="#contact" k="hero_cta1" />
            <T as="a" className="btn" href={CV_URL} download k="hero_cta2" />
          </Reveal>
        </div>

        <Reveal className="avatar-wrap">
          <HeroScene />
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
