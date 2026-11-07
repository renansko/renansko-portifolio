import { NAV_ITEMS } from '../data.js';
import { T, useLang } from '../i18n-context.jsx';

export default function Nav() {
  const { lang, setLang } = useLang();
  return (
    <nav className="top">
      <a href="#top" className="brand">
        <span className="dot" />
        <T k="brand" />
      </a>
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <T as="a" k={item.key} href={item.href} data-idx={item.idx} />
          </li>
        ))}
      </ul>
      <div className="right">
        <div className="lang">
          {['pt', 'en'].map((code) => (
            <button key={code} className={lang === code ? 'active' : undefined} onClick={() => setLang(code)}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
