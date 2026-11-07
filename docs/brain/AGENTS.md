# Regras do Brain

Padrão: <https://github.com/renansko/llm-brain-backend>.

- Leia [index.md](index.md) e as páginas relacionadas antes de alterar um módulo documentado.
- Confira contratos críticos contra código e testes (`npm test`); a doc pode estar desatualizada.
- Mudou comportamento, contrato, integração, efeito colateral ou regra de produto → atualize código **e** Brain no mesmo trabalho, e registre em [log.md](log.md).
- Uma página por conceito, menos de 100 linhas, nome em `PascalCase`, alcançável pelo índice.
- Registre só o não óbvio: decisões, invariantes, integrações. Não copie a implementação.
- Toda página aponta o código-fonte; no código use `// @wiki docs/brain/...`.
- Nunca registre segredos, API keys, payloads reais ou dados pessoais além dos já públicos no site.
