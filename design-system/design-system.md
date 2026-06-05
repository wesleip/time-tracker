# Design System

Este documento define o sistema visual da aplicação de controle de horas e produtividade.

O objetivo é criar uma experiência focada em organização, clareza e produtividade, evitando excesso de estímulos visuais.

A interface deve transmitir:

* Organização
* Planejamento
* Calma
* Profissionalismo
* Eficiência

O design deve priorizar legibilidade, simplicidade e facilidade de uso durante longos períodos de trabalho.

---

# Filosofia de Design

## Princípios

* Mobile First
* Simplicidade acima de complexidade
* Conteúdo acima de decoração
* Poucos elementos chamando atenção
* Consistência visual
* Alta legibilidade
* Interfaces tranquilas e não cansativas

## Inspirações

A experiência deve lembrar ferramentas modernas de produtividade:

* Linear
* Notion
* Todoist
* Height
* Plane

Evitar aparência de:

* Fintech
* Dashboard financeiro
* Sistema corporativo antigo
* Aplicações com excesso de gradientes e efeitos

---

# Paleta de Cores

## Identidade Principal

A identidade visual utiliza tons suaves inspirados em:

* Verde sálvia
* Azul acinzentado
* Off-white

Essas cores transmitem produtividade e organização sem gerar distrações.

### Cores Primárias

```css
primary-50:  #f3f7f5;
primary-100: #e7efeb;
primary-200: #d4e2dc;
primary-300: #bfd4ca;
primary-400: #a3c0b2;
primary-500: #7fa391;
primary-600: #678574;
primary-700: #536b5d;
```

### Cores Secundárias

```css
secondary-50:  #f5f7fa;
secondary-100: #edf1f5;
secondary-200: #dde4eb;
secondary-300: #c8d2dc;
secondary-400: #a8b8c7;
secondary-500: #8294a5;
secondary-600: #697b8c;
```

---

# Gradiente Principal

Utilizar gradientes apenas em locais estratégicos.

```css
background: linear-gradient(
  135deg,
  #bfd4ca 0%,
  #a8b8c7 100%
);
```

Usos permitidos:

* Logo
* Header principal
* Destaques específicos

Evitar uso excessivo.

---

# Cores de Fundo

A aplicação deve utilizar tema claro por padrão.

```css
bg-primary:   #fafaf8;
bg-secondary: #ffffff;
bg-tertiary:  #f2f4f3;
```

### Uso

bg-primary

* Fundo geral da aplicação

bg-secondary

* Cards
* Modais
* Containers

bg-tertiary

* Hover
* Inputs
* Áreas secundárias

---

# Cores de Texto

```css
text-primary:   #263238;
text-secondary: #54626d;
text-muted:     #8a97a2;
```

### Uso

text-primary

* Conteúdo principal

text-secondary

* Descrições
* Labels

text-muted

* Informações auxiliares

---

# Cores de Estado

## Sucesso

```css
success: #9bc9a8;
```

## Erro

```css
error: #d9a5a5;
```

## Aviso

```css
warning: #e8d2a4;
```

## Informação

```css
info: #a9c5d8;
```

Todos os estados devem utilizar versões suaves e discretas.

---

# Tipografia

## Fonte Principal

```css
font-family: Inter, system-ui, sans-serif;
```

## Hierarquia

### Título Principal

```css
text-3xl
font-semibold
```

### Título de Seção

```css
text-2xl
font-semibold
```

### Título de Card

```css
text-lg
font-medium
```

### Texto Padrão

```css
text-base
font-normal
```

### Texto Secundário

```css
text-sm
font-normal
```

Evitar uso excessivo de:

```css
font-bold
```

---

# Componentes

## Botões

### Botão Primário

Representa ações principais.

```css
background: primary-500;
color: white;
```

### Botão Secundário

Representa ações de apoio.

```css
background: white;
border: 1px solid primary-200;
```

### Botão Perigoso

```css
background: error;
color: white;
```

---

# Cards

## Card Padrão

```css
background: white;
border: 1px solid primary-100;
border-radius: 12px;
```

### Hover

```css
border-color: primary-300;
box-shadow: 0 8px 24px rgba(0,0,0,0.04);
```

---

# Dashboard

Os indicadores devem ser discretos.

### Horas Hoje

```css
background: #f3f7f5;
border-left: 4px solid #7fa391;
```

### Horas da Semana

```css
background: #f5f7fa;
border-left: 4px solid #8294a5;
```

### Horas do Mês

```css
background: #faf6ef;
border-left: 4px solid #d2b97d;
```

---

# Projetos

Cada projeto pode possuir uma cor de identificação.

Essas cores devem aparecer apenas como:

* Badge
* Tag
* Indicador lateral
* Avatar do projeto

Nunca utilizar essas cores como fundo de páginas inteiras.

### Sugestões

```css
project-green:  #C7DCCB;
project-blue:   #D8E4F0;
project-orange: #F0DCCB;
project-purple: #E7D8F0;
project-lime:   #DCE8C7;
```

---

# Formulários

Todos os campos devem seguir:

```css
background: white;
border: 1px solid primary-100;
```

Focus:

```css
border-color: primary-500;
```

Objetivos:

* Clareza
* Facilidade de leitura
* Baixa carga cognitiva

---

# Espaçamentos

```css
spacing-1: 4px;
spacing-2: 8px;
spacing-3: 12px;
spacing-4: 16px;
spacing-6: 24px;
spacing-8: 32px;
spacing-12: 48px;
spacing-16: 64px;
```

---

# Bordas

```css
rounded-md: 6px;
rounded-lg: 8px;
rounded-xl: 12px;
rounded-2xl: 16px;
```

---

# Sombras

Utilizar sombras suaves.

```css
shadow-sm
shadow-md
shadow-lg
```

Evitar sombras agressivas.

---

# Responsividade

Breakpoints padrão do TailwindCSS.

```css
sm: 640px;
md: 768px;
lg: 1024px;
xl: 1280px;
2xl: 1536px;
```

Princípios:

* Mobile First
* Cards empilhados em telas pequenas
* Sidebar recolhível
* Navegação simplificada em dispositivos móveis

---

# Animações

As animações devem ser discretas.

```css
transition-all duration-200
```

Permitido:

* Hover
* Focus
* Mudança de estado

Evitar:

* Animações excessivas
* Efeitos chamativos
* Elementos piscando

---

# Acessibilidade

## Requisitos

* Contraste adequado
* Navegação por teclado
* Focus visível
* Labels obrigatórios
* Estrutura semântica

## Inputs

Sempre possuir label associado.

## Botões

Sempre possuir texto claro e objetivo.

---

# Regra Principal

Ao implementar qualquer tela ou componente, priorize:

1. Clareza
2. Organização
3. Produtividade
4. Consistência

A aplicação deve parecer uma ferramenta profissional de planejamento e controle de tempo, não um sistema financeiro ou dashboard de marketing.
