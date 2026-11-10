import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App.jsx';

describe('App', () => {
  it('renderiza todas as seções', () => {
    render(<App />);
    for (const id of ['top', 'about', 'skills', 'experience', 'projects', 'contact']) {
      expect(document.getElementById(id), id).toBeInTheDocument();
    }
    expect(document.querySelectorAll('.project-card')).toHaveLength(5);
    expect(document.querySelectorAll('.exp-item')).toHaveLength(4);
  });

  it('troca o idioma e persiste a escolha', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem('lang')).toBe('en');
  });

  it('filtra projetos por categoria esmaecendo os demais', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'IA & LLMs' }));
    const dimmed = [...document.querySelectorAll('.project-card.dimmed')].map((c) => c.dataset.category);
    expect(dimmed).toHaveLength(4);
    expect(dimmed).not.toContain('ai');
  });

  it('aplica tweaks de tema no body', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Noite' }));
    expect(document.body.dataset.theme).toBe('dark');
    expect(JSON.parse(window.localStorage.getItem('tweaks-v2')).theme).toBe('dark');
  });

  it('renderiza a cena de fundo escondida de tecnologia assistiva', () => {
    render(<App />);
    const scene = document.querySelector('.scene');
    expect(scene).toBeInTheDocument();
    expect(scene).toHaveAttribute('aria-hidden', 'true');
  });

  it('modo efetivo é claro por padrão e escuro após escolher Noite', () => {
    render(<App />);
    expect(document.body.dataset.mode).toBe('light');
    fireEvent.click(screen.getByRole('button', { name: 'Noite' }));
    expect(document.body.dataset.mode).toBe('dark');
  });

  it('Movimento desligado marca o body e persiste em tweaks-v2', () => {
    render(<App />);
    expect(document.body.dataset.motion).toBe('on');
    fireEvent.click(screen.getByRole('button', { name: 'Desligado' }));
    expect(document.body.dataset.motion).toBe('off');
    expect(JSON.parse(window.localStorage.getItem('tweaks-v2')).motion).toBe('off');
  });

  it('o CSS não usa mais o seletor antigo de tema escuro (tokens seguem data-mode)', () => {
    const css = readFileSync(join(__dirname, '..', 'src', 'styles.css'), 'utf8');
    expect(css).not.toMatch(/data-theme="dark"\]/);
    expect(css).toMatch(/body\[data-mode="dark"\]/);
  });
});
