import { useEffect, useState } from 'react';
import { T } from '../i18n-context.jsx';

function brtTime() {
  return new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Sao_Paulo' });
}

export default function Footer() {
  const [time, setTime] = useState(brtTime);

  useEffect(() => {
    const id = setInterval(() => setTime(brtTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer>
      <div>© 2026 RENAN SKONICEZNY VILELA</div>
      <T as="div" k="footer_built" />
      <div id="clock">LOCAL · {time} · BRT</div>
    </footer>
  );
}
