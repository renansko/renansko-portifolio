// Mascote + assistente do portfólio.
// @wiki docs/brain/services/CapiBot.md
import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n-context.jsx';
import { DIALOG_KNOWLEDGE, TOPICS, localAnswer } from './knowledge.js';
import { askOpenAI, renderAssistantText } from './openai.js';

const IDLE_IMG = 'uploads/capivara_idle.png';
const WAVE_IMG = 'uploads/capivara.gif';
const FADE_MS = 120;

const API_STATE = {
  empty: { pt: 'Sem chave: respostas rápidas usam apenas o currículo local.', en: 'No key: quick answers use the local résumé only.' },
  loaded: { pt: 'Chave carregada apenas nesta aba. Pergunte qualquer coisa.', en: 'Key loaded for this tab only. Ask anything.' },
  forgotten: { pt: 'Chave esquecida. Puff. Sumiu mesmo.', en: 'Key forgotten. Poof. It is really gone.' },
};

export default function CapiBot() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [text, setText] = useState(DIALOG_KNOWLEDGE.pt.welcome);
  const [visible, setVisible] = useState(true);
  const [question, setQuestion] = useState('');
  // A chave vive só neste estado React: some ao recarregar/fechar a aba.
  const [apiKey, setApiKey] = useState('');
  const [apiState, setApiState] = useState('empty');
  const [pending, setPending] = useState(false);
  const [history, setHistory] = useState([]);
  const textRef = useRef(null);
  const inputRef = useRef(null);
  const apiKeyRef = useRef(null);
  const fadeTimer = useRef(null);

  useEffect(() => {
    // Pré-carrega o GIF para a troca no hover ser instantânea.
    new Image().src = WAVE_IMG;
    return () => clearTimeout(fadeTimer.current);
  }, []);

  const showText = (html) => {
    setVisible(false);
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setText(html);
      setVisible(true);
      if (textRef.current) textRef.current.scrollTop = 0;
    }, FADE_MS);
  };

  const toggle = () => {
    if (!open) showText(DIALOG_KNOWLEDGE[lang].welcome);
    setOpen(!open);
  };

  const onApiKeyChange = (e) => {
    setApiKey(e.target.value);
    setApiState(e.target.value.trim() ? 'loaded' : 'empty');
  };

  const forgetKey = () => {
    setApiKey('');
    setHistory([]);
    setApiState('forgotten');
    apiKeyRef.current?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (pending || !q) return;
    setQuestion('');

    const key = apiKey.trim();
    if (!key) {
      showText(localAnswer(q, lang));
      return;
    }

    setPending(true);
    showText(lang === 'pt' ? 'Consultando a capivara na nuvem…' : 'Consulting the capybara in the cloud…');
    try {
      const result = await askOpenAI({ question: q, apiKey: key, history });
      setHistory(result.history);
      showText(renderAssistantText(result.answer));
    } catch (error) {
      const prefix = lang === 'pt'
        ? '<strong>Não rolou.</strong> A chave não foi salva. A OpenAI respondeu: '
        : '<strong>It did not work.</strong> The key was not saved. OpenAI replied: ';
      showText(prefix + renderAssistantText(error.message));
    } finally {
      setPending(false);
      // O input só pode receber foco depois de reabilitado.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="capy-container">
      <div className={`capy-speech-bubble${open ? ' open' : ''}`} id="capyBubble">
        <div className="capy-bubble-top">
          <span className="capy-bubble-status">
            <span className="dot" /> CapiBot · Assistente Virtual
          </span>
          <div className="capy-bubble-actions">
            <button
              className="capy-bubble-btn"
              title="Reiniciar"
              onClick={() => {
                setHistory([]);
                showText(DIALOG_KNOWLEDGE[lang].welcome);
              }}
            >
              ↺
            </button>
            <button className="capy-bubble-btn" title="Fechar" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
        </div>

        <div
          ref={textRef}
          className={`capy-bubble-text${pending ? ' loading' : ''}`}
          style={{ opacity: visible ? 1 : 0 }}
          aria-live="polite"
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <div className="capy-bubble-topics">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              className="capy-topic-pill"
              disabled={pending}
              onClick={() => showText(DIALOG_KNOWLEDGE[lang][topic.id])}
            >
              {topic.label}
            </button>
          ))}
        </div>

        <div className="capy-api-setup">
          <div>
            <strong>RAG de férias 🥲</strong> — não tenho uma API key disponível porque, tecnicamente falando, estou pobre. Se
            quiser perguntas livres, empreste a sua:
          </div>
          <div className="capy-api-row">
            <input
              ref={apiKeyRef}
              type="password"
              id="capyApiKey"
              placeholder="sk-... (não será salva)"
              autoComplete="off"
              spellCheck={false}
              aria-label="OpenAI API key"
              value={apiKey}
              disabled={pending}
              onChange={onApiKeyChange}
            />
            <button type="button" onClick={forgetKey}>
              Esquecer
            </button>
          </div>
          <div className="capy-api-note">
            Confiança em portfólio público? Corajoso. A chave fica só na memória desta aba e vai diretamente à OpenAI. Este
            site não salva, registra nem envia a chave ao Renan. Fechou ou recarregou a aba: evaporou. Ainda assim, use uma
            chave temporária e com limite de gastos.
          </div>
          <div className="capy-api-state">{API_STATE[apiState][lang]}</div>
        </div>

        <form className="capy-bubble-input" onSubmit={submit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ou digite sua dúvida..."
            autoComplete="off"
            maxLength={500}
            aria-label="Pergunta para o CapiBot"
            value={question}
            disabled={pending}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" disabled={pending} aria-label="Enviar">
            ➤
          </button>
        </form>
      </div>

      <button
        className="capy-avatar-btn"
        aria-label="Assistente Virtual"
        title="Conversar com o assistente"
        onClick={toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img src={open || hover ? WAVE_IMG : IDLE_IMG} alt="Capivara Assistente" className="capy-avatar-img" />
      </button>
    </div>
  );
}
