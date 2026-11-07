import { SKILLS } from '../data.js';
import { T } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';

export default function Skills() {
  return (
    <section id="skills">
      <SectionHeader num="02" titleKey="sec_skills" tag="WHAT" />
      <div className="skills-grid">
        {SKILLS.map((cat) => (
          <Reveal className="skill-cat" key={cat.key}>
            <T as="h3" k={cat.key} />
            <ul className="skill-list">
              {cat.items.map(([name, level, pct]) => (
                <li key={name}>
                  <span className="name">{name}</span>{' '}
                  <span className="lvl">
                    {level} <span className="bar" style={{ '--p': `${pct}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
