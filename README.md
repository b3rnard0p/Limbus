<h1 align="center">Limbus - Mapa Interativo da Divina Comédia (MVP)</h1>

O **Limbus** é uma plataforma educacional e exploratória que recria a jornada de Dante Alighieri por meio de mapas interativos. O sistema permite que administradores cadastrem pontos de interesse (Pins) e Portais que conectam os mapas do Inferno, Purgatório, Paraíso, mapa Medieval e o mundo atual.

Com uma interface imersiva e responsiva, o projeto utiliza tecnologias modernas como **Vue 3**, **OpenSeadragon** e **Globe.gl** para proporcionar uma navegação fluida em imagens gigantescas e renderizações 3D realistas, suportado por um backend robusto em **Node.js** com **MongoDB** para o gerenciamento de conteúdo e otimização automatizada de mídias.

<h2 align="center">Sumário</h2>

* [Controllers](#controllers)
* [Middlewares & Tratamento de Erros](#middlewares--tratamento-de-erros)
* [Models](#models)
* [Security](#security)
* [Frontend (Arquitetura da Interface & Mapas)](#frontend-arquitetura-da-interface--mapas)
* [Tecnologias & Dependências](#tecnologias--dependências)
* [Comandos Úteis](#comandos-úteis)
* [Deploy](#deploy)

<h2 align="center">Controllers</h2>

Abaixo estão detalhados os controladores que compõem a lógica de negócio do sistema de mapas:

### 1. PinController

Gerencia a gestão espacial e o coração do sistema, responsável pela manutenção dos **Pontos de Interesse (Pins)**.

- **Operações e Validações:** Permite a criação, leitura, atualização e exclusão (CRUD) dos Pins. O fluxo passa por uma camada de Serviço (`PinService`) que barra a criação de Pins com títulos duplicados dentro de um mesmo mapa.
- **Processamento de Dados:** Higieniza o HTML recebido (usando `sanitize-html` para evitar XSS) e trata os vínculos de imagens (galeria e ícone personalizado).
- **Tipos de Pin:** Distingue entre Pins editoriais (informações históricas) e portais (transição interativa entre diferentes mapas da Divina Comédia).

### 2. AuthController

Lida com a segurança e identidade dos administradores do sistema.

- **Autenticação Avançada:** Gerencia o fluxo de login gerando e validando uma arquitetura de dois tokens (Access Token e Refresh Token) enviados de forma ultra-segura através de **Cookies HTTP-Only**, mitigando completamente ataques XSS.
- **Auto-Provisionamento:** Cria dinamicamente o primeiro usuário Administrador no banco de dados durante a inicialização do sistema, caso nenhum exista.

<h2 align="center">Middlewares & Tratamento de Erros</h2>

A camada de middlewares intercepta requisições para validação e processamento de mídias antes de atingirem os controllers, garantindo performance e segurança.

### 1. Auth Middleware (`auth.js`)

- **Segurança de Rotas:** Verifica a presença e a validade do token JWT no cabeçalho `Authorization`, protegendo todas as rotas administrativas contra acessos não autorizados.

### 2. Upload Middleware (`upload.js`)

- **Gestão de Arquivos:** Configura o `multer` utilizando `memoryStorage` para reter temporariamente as imagens enviadas (uploads de pin ou galeria) na memória RAM, permitindo seu processamento intermediário antes de salvar em disco.

### 3. Otimização de Imagens (`optimizeImages.js`)

- **Performance Extrema:** Intercepta os arquivos em memória e utiliza a biblioteca **Sharp** para convertê-los automaticamente para o formato **WebP** (aplicando compressão de qualidade). Isso reduz drasticamente o tráfego de rede e melhora a velocidade de carregamento dos modais no frontend.

### 4. Tratamento Global de Erros (`errorHandler.js` e `asyncHandler.js`)

- **Consistência:** Centraliza a captura de exceções em rotas assíncronas e formata as respostas de erro de forma estruturada (status HTTP, mensagem e stack trace em ambiente de desenvolvimento), impedindo a quebra do servidor e melhorando a estabilidade.

<h2 align="center">Models</h2>

A estrutura de dados é gerenciada via **Mongoose** no MongoDB, focada em performance e relacionamento de dados não-relacionais.

### 1. Pin

Define a estrutura central dos marcadores interativos e portais.

- **Atributos Espaciais e Literários:** `x`, `y` (coordenadas bidimensionais precisas), `mapId` (identificador do mapa onde o pin está alocado) e `canto` (vínculo numérico direto com um Canto específico da obra literária).
- **Conteúdo Rico:** `title`, `contentHtml` (textos ricos) e `references` (links externos de estudo).
- **Mídia:** Gestão integrada de `imageUrl` (imagem de capa), `pinImageUrl` (ícone customizado no mapa) e `gallery` (coleção de imagens complementares).
- **Classificação:** `pinType` gerencia o comportamento do marcador (`editorial` para texto ou `portal` para navegação imersiva).
- **Curiosidades:** O atributo booleano `isCuriosity` permite marcar pins como "curiosidades" (easter-eggs de mundo livre), retirando-os da listagem oficial da Jornada Cronológica.

### 2. User

Entidade administrativa do sistema.

- **Segurança:** Define o acesso administrador com proteção e criptografia de senha utilizando hashing do `bcrypt`.

<h2 align="center">Security</h2>

A segurança da aplicação segue boas práticas para garantir a integridade dos dados expostos e proteger a API.

- **Autenticação Robusta (Dual Token JWT):** O sistema abandona sessões clássicas e armazena os tokens de acesso e refresh exclusivamente em **Cookies HTTP-Only**. O frontend conta com um interceptador global na API (`api.js`) que capta falhas de rede (Offline) e erros `401 Unauthorized`, integrando-se nativamente a um sistema de **Global Toasts** para feedback visual imediato.
- **Criptografia:** Armazenamento seguro de senhas no banco de dados via hash gerado pelo `bcrypt`.
- **Prevenção contra XSS:** Textos formatados digitados no painel admin (WYSIWYG) são estritamente filtrados pelo `sanitize-html` antes de serem persistidos no banco de dados.
- **Proteções de Rede:** Utilização da biblioteca **Helmet** para injetar cabeçalhos HTTP seguros, **CORS** para restrição de origens aceitas e **Express Rate Limit** para prevenir ataques de força bruta, limitando excesso de requisições por IP.

<h2 align="center">Frontend (Arquitetura da Interface & Mapas)</h2>

O frontend SPA (Single Page Application) foi construído utilizando tecnologias de ponta para renderização gráfica e construção de interfaces imersivas.

### Estrutura e Interação

- **Renderização Híbrida de Mapas (`MapViewer.vue`):** O projeto utiliza três estratégias de renderização conforme a natureza do mapa sendo visualizado:
  - **OpenSeadragon (Deep Zoom):** Fundamental para renderizar as imagens gigantescas da jornada de Dante (`tileMode: false`). Fatiadas no formato DZI (Deep Zoom Image) pelo backend, permite zoom infinito e suave (semelhante à arquitetura do Google Maps) sem estourar a memória RAM da aba do navegador. Suporta bloqueio inteligente de bordas e click-tracking nativo para manipulação dos eixos cartesianos X e Y.
  - **Leaflet (2D):** Utilizado complementarmente em cenários onde há necessidade do motor geográfico dinâmico (`tileMode: true`), como no Mapa do mundo atual (Earth). Suporta a integração nativa com servidores de Map Tiles do Google Maps (satélite e híbrido).
  - **Globe.gl (WebGL 3D):** Transforma a experiência de visualização do mundo real em uma representação imersiva de um globo terrestre 3D. Processa texturas estáticas da Terra cruzando dados vetoriais de localizações geográficas (através de busca dinâmica de JSON traduzido para o Português) renderizados diretamente na GPU da máquina.
- **Interatividade e Configurações Reativas:**
  - **Alternância Dinâmica 2D/3D:** O usuário e o administrador podem transitar sem interrupções entre o mapa geográfico 2D (Leaflet) e o modelo tridimensional (Globe.gl).
  - **Controle de Divisão Política:** Ambos os mapas respondem de maneira reativa ao toggle global de "Divisão Política" no painel de configurações. Ao ser ativado/desativado, o Leaflet transita dinamicamente entre as camadas (camada mista para satélite limpo), enquanto o Globo 3D adiciona ou remove os vértices vetoriais de texto dos países, deixando a navegação focada integralmente nos Portais (Pins).
  - **Modo Jornada Cronológica:** Inteligência de mapa capaz de limpar todos os pins não atrelados à aventura principal e ordená-los globalmente, injetando uma elegante insígnia circular sobre cada ponto cronológico (ex: `#1`, `#2`). O cálculo ocorre em tempo real, baseando-se em todos os mapas existentes e ignorando pontos marcados como "Curiosidade" pelos administradores.
  - **Sistema de Busca Rápida (Cantos):** Ferramenta integrada ao cabeçalho (com morphing UI) que permite aos usuários digitarem o número de um Canto específico e serem teletransportados diretamente para a localização correspondente na jornada, acompanhado de um dropdown inteligente que herda a paleta de cores do sistema.
  - **Estética e Imersão:** Customização visual profunda onde os mapas operam com um ponteiro de mouse exclusivo (Logo do Limbus) via CSS injetado especificamente nas *views* dos gráficos, preservando o cursor clássico nativo do OS para botões e modais de UI.
- **Componentização Avançada:** Arquitetura organizada em `/components` com foco estrito em reuso modular. Destacam-se Modais customizados (`WindowModal.vue`, `PinModal.vue`) com estética visual tipo "pergaminho" e formulários de administração dinâmicos e flutuantes (`AdminPanel.vue`).
- **Navegação e Estilização:** O fluxo entre painéis e telas é controlado pelo Vue Router, com responsividade total garantida através do **Tailwind CSS**.

<h2 align="center">Tecnologias & Dependências</h2>

A Stack tecnológica foi selecionada especificamente para garantir escalabilidade no processamento assíncrono de imagens e total fluidez na interface de usuário.

### Core Stack (Backend)
- **Node.js** com **Express** (Framework Web e Roteamento)
- **MongoDB** com **Mongoose** (Banco de Dados NoSQL e ODM)
- **Sharp** (Processamento intensivo de Imagens e geração de Deep Zoom)
- **Multer** (Gestão em memória para Upload de Arquivos multipart/form-data)
- **JJWT (JSON Web Token)** e **Bcrypt** (Segurança e Criptografia)

### Core Stack (Frontend)
- **Vue 3** (Composition API) e **Vite** (Build Tool super rápido)
- **Tailwind CSS** (Estilização Avançada Baseada em Utilitários)
- **OpenSeadragon** (Motor em Canvas/DOM de visualização de altíssima resolução)
- **Leaflet** (Renderização geo-referenciada 2D dinâmica)
- **Globe.gl / Three.js** (Motor avançado WebGL para visualização imersiva 3D do globo)
- **Lucide-Vue** (Ícones vetoriais modernos para a interface)
- **Quill.js** (`@vueup/vue-quill`) (Editor WYSIWYG de textos ricos)

<h2 align="center">Comandos Úteis</h2>

O ecossistema do projeto foi construído para facilidade de inicialização através da biblioteca `concurrently`, permitindo executar todos os módulos integrados.

### Build e Execução Global
Na raiz do projeto (`/MVP`), estão disponíveis os seguintes comandos:
- `npm run install:all`: Instala as dependências da raiz, do backend e do frontend sequencialmente de uma só vez.
- `npm run dev`: Inicia o servidor backend e o ambiente de desenvolvimento do frontend simultaneamente, monitorando alterações em tempo real (HMR).
- `npm run build`: Compila e minimiza o código frontend para produção.
- `npm run start`: Inicia apenas o servidor backend preparado para ambiente de produção.

### Fatiamento de Mapas (Deep Zoom Engine)
Para processar e preparar o sistema de imagens gigantescas (DZI - Deep Zoom Image) necessárias pelo frontend:
- `node generate-tiles.mjs`: Script executável independente que utiliza a biblioteca Sharp para mapear imagens do projeto (`Medieval.webp`, `Inferno.webp`, etc.) e fatiá-las em uma cascata de minúsculos recortes/tiles de 256x256 pixels e pirâmides de resolução. 

<h2 align="center">Deploy</h2>

*(Atualmente o projeto não conta com artefatos de containerização base como `Dockerfile` ou `docker-compose.yml`, portanto este tópico pode ser complementado assim que for definida a infraestrutura de hospedagem da faculdade. A aplicação está estruturada para ter o backend Node hospedado como App Service/PM2 e o frontend via CDN ou servidor de arquivos estáticos).*

---
<p align="center">Este código é de propriedade exclusiva de <b>@b3rnard0p</b></p>
