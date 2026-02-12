# 📦 SmartStock - Frontend

Sistema de gerenciamento de estoque simples e eficiente. Este projeto compõe a interface do usuário (Client-side), permitindo visualizar, criar, editar e excluir produtos através de uma comunicação RESTful com o Backend.

## 🚀 Tecnologias Utilizadas

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React (Sugestão para melhoria visual futura)
- **Gerenciamento de Estado:** React Hooks (useState, useEffect)

## ⚙️ Funcionalidades

- **Listagem de Produtos:** Visualização clara com tabela responsiva.
- **CRUD Completo:** Criação, Leitura, Atualização e Deleção de itens.
- **Feedback Visual:** Indicadores de carregamento (loading) e alertas de sucesso/erro.
- **Validação:** Verificação básica de campos obrigatórios no frontend.

## 📂 Estrutura de Pastas Importantes

```bash
src/
├── app/
│   ├── produtos/      # Página principal do CRUD
│   ├── page.tsx       # Redirecionamento da raiz
│   └── layout.tsx     # Layout global (fontes, meta tags)
├── services/
│   └── api.ts         # Configuração centralizada da API
```
