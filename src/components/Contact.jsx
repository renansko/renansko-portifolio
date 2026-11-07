import { CV_URL, EMAIL, GITHUB_URL, LINKEDIN_URL, PHONE, PHONE_LABEL } from '../data.js';
import { T, useLang } from '../i18n-context.jsx';
import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';

const linkStyle = { color: 'var(--fg)', textDecoration: 'none' };

function LinkCard({ label, href, text, external, copy, onCopy }) {
  const extProps = external ? { target: '_blank', rel: 'noopener' } : {};
  return (
    <div className="cta-link-card">
      <div>
        <span className="k">{label}</span>
        <a className="v" href={href} style={linkStyle} {...extProps}>
          {text}
        </a>
      </div>
      {copy ? (
        <button className="cta-copy-btn" title={`Copiar ${label.toLowerCase()}`} onClick={() => onCopy(copy)}>
          📋
        </button>
      ) : (
        <a className="cta-copy-btn" href={href} style={{ textDecoration: 'none' }} {...extProps}>
          ↗
        </a>
      )}
    </div>
  );
}

export default function Contact({ onToast }) {
  const { lang } = useLang();

  const copy = (text) => {
    const done = lang === 'pt' ? '✓ Copiado para a área de transferência!' : '✓ Copied to clipboard!';
    if (!navigator.clipboard) {
      onToast(text);
      return;
    }
    navigator.clipboard.writeText(text).then(() => onToast(done), () => onToast(text));
  };

  return (
    <section id="contact">
      <SectionHeader num="05" titleKey="sec_contact" tag="WHERE" />
      <Reveal className="cta">
        <div className="cta-content">
          <T as="div" className="cta-kicker" k="cta_kicker" />
          <T as="h2" className="cta-title" k="cta_title" />
          <div className="hero-actions">
            <T as="a" className="btn primary" href={`mailto:${EMAIL}`} k="cta_btn1" />
            <T as="a" className="btn" href={CV_URL} download k="cta_btn2" />
          </div>

          <div className="cta-links">
            <LinkCard label="EMAIL" href={`mailto:${EMAIL}`} text={EMAIL} copy={EMAIL} onCopy={copy} />
            <LinkCard label="LINKEDIN" href={LINKEDIN_URL} text="/in/renan-skonicezny-vilela" external />
            <LinkCard label="GITHUB" href={GITHUB_URL} text="@renansko" external />
            <LinkCard label="TELEFONE / WHATSAPP" href={`tel:${PHONE}`} text={PHONE_LABEL} copy={PHONE} onCopy={copy} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
