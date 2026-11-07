// Preferências do visitante (idioma e tema). Nunca use para credenciais.
// localStorage pode lançar em janela privada ou com cookies bloqueados.

export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sem persistência: a página continua funcionando.
  }
}
