import { T } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';

export default function SectionHeader({ num, titleKey, tag }) {
  return (
    <Reveal className="section-header">
      <span className="num">{num}</span>
      <T className="title" k={titleKey} />
      <span className="line" />
      <span className="tag">— {tag}</span>
    </Reveal>
  );
}
