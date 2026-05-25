# AGENTS.md — FoodWise Frontend

## Visão geral do projeto

**FoodWise** é uma aplicação web desenvolvida para ajudar usuários a gerenciar o estoque de alimentos em casa, combatendo o desperdício por meio do rastreamento de datas de validade, organização dos alimentos por local de armazenamento e uso de recursos inteligentes com câmera e IA.

A plataforma permite que o usuário visualize seus alimentos, acompanhe vencimentos, receba alertas visuais, converse com uma IA por chat e utilize a câmera do dispositivo para análise de alimentos por imagem.

O frontend é desenvolvido com:

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion

A experiência deve ser moderna, responsiva, fluida, acessível e agradável, com foco em simplicidade, clareza visual e facilidade de uso.

---

## Objetivo do frontend

O frontend do FoodWise deve:

- Exibir uma interface web moderna, responsiva e intuitiva;
- Permitir navegação clara entre dashboard, estoque, câmera e chat;
- Usar animações suaves e funcionais com Framer Motion;
- Estar preparado para integração com backend via API Gateway;
- Utilizar componentes modulares, reutilizáveis e bem organizados;
- Manter uma arquitetura limpa, escalável e de fácil manutenção;
- Separar corretamente UI, regras de negócio, services, hooks e tipos;
- Evitar duplicação de código;
- Manter uma experiência consistente em desktop, tablet e mobile.

---

## UI/UX

- O design deve ser moderno, minimalista e utilizar animações fluidas e performaticas com framer motion.
- A experiencia do usuario deve sempre ser levada em consideração.
- Utilize lucid icons para icones.
- Todo o site deve ter aspecto arredondado e minimalista.

## Stack obrigatória

Use obrigatoriamente:

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- React com componentes funcionais
- Arquitetura modular
- Código limpo, legível e de fácil manutenção

---

## Nome do projeto

Nome da plataforma: FoodWise

Áreas da aplicação:

- Tela de login com Google
- Dashboard com subpaginas:
    - Estoque
    - Câmera com analise de foto por AI e Chat com IA

- Configurações

Locais de armazenamento:

- Geladeira
- Freezer
- Despensa

# Segurança

- O frontend sempre deve verificar e validar os dados com o backend (da forma mais performatica possivel). O backend é a fonte de toda a verdade, dados sensiveis sempre devem ser validados.