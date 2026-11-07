import { MARQUEE } from '../data.js';

export default function Marquee() {
  // A lista é duplicada para o loop da animação CSS não ter emenda.
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
