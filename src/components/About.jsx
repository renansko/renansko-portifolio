import { INFO_ROWS } from '../data.js';
import { T } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';

export default function About() {
  return (
    <section id="about">
      <SectionHeader num="01" titleKey="sec_about" tag="WHO" />
      <div className="about-grid">
        <Reveal>
          <T as="h2" className="about-title" k="about_title" />
          <div className="about-body">
            <T as="p" k="about_p1" />
            <T as="p" k="about_p2" />
            <T as="p" k="about_p3" />
          </div>
        </Reveal>
        <Reveal>
          <div className="info-card">
            {INFO_ROWS.map((row) => (
              <div className="row" key={row.k}>
                <T as="div" className="k" k={row.k} />
                {row.vKey ? <T as="div" className="v" k={row.vKey} /> : <div className="v">{row.v}</div>}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
