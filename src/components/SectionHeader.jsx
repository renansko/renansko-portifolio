import { T } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';

export default function SectionHeader({ num, titleKey, tag }) {
  return (
    <Reveal className="section-header">
      <span className="num">{num}</span>
      <T k={titleKey} />
      <span className="line" />
      <span>— {tag}</span>
    </Reveal>
  );
}
