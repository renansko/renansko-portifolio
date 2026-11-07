import { useState } from 'react';
import { PROJECT_FILTERS, PROJECTS } from '../data.js';
import { T } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';

export default function Projects() {
  const [filter, setFilter] = useState('all');

  return (
    <section id="projects">
      <SectionHeader num="04" titleKey="sec_proj" tag="HOW" />

      <Reveal className="proj-filter-bar">
        {PROJECT_FILTERS.map((f) => (
          <T
            as="button"
            key={f.id}
            k={f.key}
            className={`proj-filter-btn${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          />
        ))}
      </Reveal>

      <div className="projects-grid">
        {PROJECTS.map((p) => {
          const dimmed = filter !== 'all' && p.category !== filter;
          return (
            <Reveal
              key={p.n}
              className={`project-card${dimmed ? ' dimmed' : ''}`}
              data-category={p.category}
              aria-hidden={dimmed || undefined}
            >
              <div className="project-head">
                <span className="id">CASE · {String(p.n).padStart(3, '0')}</span>
                <T k={`proj_scope${p.n}`} />
              </div>
              <h3 className="project-name">{p.name}</h3>
              <T as="div" className="project-role" k={`proj_role${p.n}`} />
              <T as="p" className="project-desc" k={`proj_desc${p.n}`} />
              <div className="project-stack">
                {p.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
