import { useState } from 'react';

const SWATCHES = [
  { id: 'cyan', color: '#22d3ee', title: 'Cyan' },
  { id: 'green', color: '#4ade80', title: 'Green' },
  { id: 'amber', color: '#fbbf24', title: 'Amber' },
  { id: 'mono', color: '#f5f5f5', title: 'Monochrome' },
];

const OPTION_ROWS = [
  { key: 'theme', label: 'Tema', options: [['dark', 'Dark'], ['light', 'Light']] },
  { key: 'density', label: 'Espaçamento', options: [['compact', 'Compact'], ['normal', 'Normal'], ['spacious', 'Spacious']] },
  { key: 'hero', label: 'Hero Glyph', options: [['v1', './dev'], ['v2', '<ai/>'], ['v3', '~root']] },
];

export default function TweaksPanel({ tweaks, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="tweaks-fab" title="Personalizar tema" onClick={() => setOpen((o) => !o)}>
        ⚙
      </button>
      <div className={`tweaks-panel${open ? ' open' : ''}`}>
        <h4>
          Personalização{' '}
          <button className="close" onClick={() => setOpen(false)}>
            ×
          </button>
        </h4>
        <div className="tweak-row">
          <label>Cor de Destaque</label>
          <div className="swatch-row">
            {SWATCHES.map((s) => (
              <button
                type="button"
                key={s.id}
                className={`swatch${tweaks.accent === s.id ? ' active' : ''}`}
                style={{ background: s.color }}
                title={s.title}
                aria-label={s.title}
                onClick={() => onChange('accent', s.id)}
              />
            ))}
          </div>
        </div>
        {OPTION_ROWS.map((row) => (
          <div className="tweak-row" key={row.key}>
            <label>{row.label}</label>
            <div className="opt-row">
              {row.options.map(([value, text]) => (
                <button
                  key={value}
                  className={tweaks[row.key] === value ? 'active' : undefined}
                  onClick={() => onChange(row.key, value)}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
