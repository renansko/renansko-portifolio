# Renan Skonicezny Vilela — Portfólio

Site pessoal e portfólio profissional de Renan Skonicezny Vilela.

- **Stack**: HTML5, CSS e JavaScript sem framework.
- **Mascote & Assistente**: CapiBot com respostas locais baseadas no currículo e integração opcional com a OpenAI Responses API.
- **Deploy**: front-end estático.

## Como o CapiBot funciona

O RAG não está disponível nesta versão. Sem uma API key, o bot responde localmente a tópicos conhecidos do currículo. O visitante também pode informar temporariamente a própria chave para fazer perguntas livres: o contexto profissional fica embutido no prompt e a requisição parte diretamente do navegador para a OpenAI.

```text
sem chave: visitante → respostas locais do currículo
com chave: visitante → OpenAI Responses API + contexto do currículo → resposta
```

A chave digitada:

- permanece somente no campo em memória durante a aba atual;
- não usa `localStorage`, `sessionStorage`, cookies ou backend do portfólio;
- é enviada apenas para `https://api.openai.com/v1/responses`;
- pode ser removida pelo botão **Esquecer** e desaparece ao recarregar ou fechar a aba.

Como a chamada é feita no navegador, prefira uma chave temporária, restrita e com limite de gastos. Para produção com uma chave do proprietário do site, a arquitetura correta é adicionar um backend seguro e nunca publicar essa credencial no HTML.

## Execução local

Sirva a pasta com qualquer servidor HTTP estático. Exemplo:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000`.

## Testes

```bash
node --test tests/capibot.contract.test.js
```
