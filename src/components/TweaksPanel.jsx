import { useState } from 'react';

const SWATCHES = [
  { id: 'grass', color: '#c4d45a', title: 'Campo' },
  { id: 'sky', color: '#a8d8f8', title: 'Céu' },
  { id: 'stripe', color: '#c7363c', title: 'Listra' },
  { id: 'sun', color: '#f5c533', title: 'Sol' },
];

const OPTION_ROWS = [
  { key: 'theme', label: 'Tema', options: [['light', 'Dia'], ['dark', 'Noite']] },
  { key: 'motion', label: 'Movimento', options: [['on', 'Ligado'], ['off', 'Desligado']] },
  { key: 'density', label: 'Espaçamento', options: [['compact', 'Compact'], ['normal', 'Normal'], ['spacious', 'Spacious']] },
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
