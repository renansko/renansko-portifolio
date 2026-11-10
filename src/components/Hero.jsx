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

export default function Hero() {
  const { t } = useLang();
  return (
    <section className="hero" id="top">
      {/* Coluna direita vazia de propósito: a árvore da cena de fundo ocupa o terço superior direito (Z). */}
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
      </div>
      <StatStrip />
    </section>
  );
}
