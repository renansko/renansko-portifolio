import { EXPERIENCE } from '../data.js';
import { T } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';

export default function Experience() {
  return (
    <section id="experience">
      <SectionHeader num="03" titleKey="sec_exp" tag="WHEN" />
      <div className="timeline">
        {EXPERIENCE.map((job, i) => (
          <Reveal className="exp-item" key={job.company}>
            <div className="exp-date">
              {job.current ? (
                <>
                  {job.start} — <T k="present" />
                  <T as="div" className="current" k="current" />
                </>
              ) : (
                `${job.start} — ${job.end}`
              )}
            </div>
            <div>
              <T as="div" className="exp-role" k={job.roleKey} />
              <div className="exp-company">
                <span className="index">{String(i + 1).padStart(2, '0')}</span>
                {job.company}
              </div>
              <T as="p" className="exp-desc" k={job.descKey} />
              <div className="exp-tags">
                {job.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
