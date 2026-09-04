# PROMPT DE DESENVOLVIMENTO FULLSTACK: MAPA INTERATIVO DIVINA COMÉDIA (MVP SEPE)

**Contexto e Papel da IA:**
Atue como um Desenvolvedor Fullstack Sênior e Arquiteto de Software. Seu objetivo é gerar o código completo (Frontend e Backend) para um MVP (Produto Mínimo Viável) de um mapa interativo baseado na "Divina Comédia" de Dante Alighieri. O sistema permitirá navegação pública e possuirá um módulo administrativo (CMS) dinâmico para inserção de dados espaciais.

---

## 1. Stack Tecnológica Obrigatória
*   **Frontend:** Vue 3 (Composition API), Vite, Tailwind CSS.
*   **Motor de Mapa (Frontend):** Leaflet.js (configurado para usar imagem estática personalizada via `L.CRS.Simple` e `L.imageOverlay`).
*   **Backend:** Node.js puro com Express.
*   **Banco de Dados:** MongoDB (com Mongoose ODM).
*   **Upload de Arquivos (Backend):** Multer (configurado para salvar localmente na pasta `/public/uploads` e retornar a URL).
*   **Editor WYSIWYG (Frontend):** TipTap ou Quill.js para Vue.

---

## 2. Requisitos Funcionais (Core)

### Módulo Público (Visualização)
*   Renderizar uma imagem de alta resolução (4K) do mapa estático usando Leaflet.
*   Bloquear as coordenadas geográficas reais, transformando o mapa em um plano de pixels (X e Y).
*   Ao carregar, o frontend deve fazer um `GET` no backend para buscar todos os pontos (pins) cadastrados e renderizá-los sobre o mapa.
*   Ao clicar em um marcador, deve abrir um modal (com design imersivo tipo "pergaminho medieval") exibindo o título, imagem de referência e o texto rico em HTML.

### Módulo Admin (Gestão de Conteúdo Espacial)
*   O usuário administrador deve conseguir acessar uma rota protegida (ex: `/admin/mapa`).
*   Ao clicar em qualquer lugar do mapa, o Leaflet deve capturar os eixos X e Y do clique e abrir um painel lateral ou modal de formulário.
*   O formulário deve conter: Título (string), Editor de Texto Rico (WYSIWYG para HTML), e Upload de Imagem (file).
*   Observação, os pins podem ser prsolaizados, se o admin quiser por uma imagem como pin no mapa, pode, caso n coloque, fica um pin padrão
*   O envio deve usar `multipart/form-data`. O backend recebe, salva a imagem via Multer, gera a URL estática e salva tudo em um documento MongoDB.

---

## 3. Diretrizes de Qualidade de Software (ISO 25010:2023)
O código gerado deve obrigatoriamente atender aos seguintes critérios da norma:

*   **Adequação Funcional:** O sistema deve executar as operações de CRUD espacial com exatidão, sem erros de conversão de coordenadas X/Y para o Leaflet.
*   **Eficiência de Desempenho:** O backend deve ser leve. O MongoDB armazenará apenas strings (URLs de mídia e HTML estático). Arquivos binários não devem tocar o banco de dados.
*   **Compatibilidade:** A API deve responder estritamente em formato JSON padrão, facilitando futura portabilidade.
*   **Usabilidade e Responsividade:** O Tailwind CSS deve garantir a usabilidade _mobile-first_. O mapa Leaflet deve suportar _pinch-to-zoom_ em telas sensíveis ao toque.
*   **Segurança:** Implementar proteção em todas as rotas POST/PUT/DELETE usando autenticação JWT (JSON Web Token). O editor WYSIWYG deve ter sanitização básica contra ataques XSS. O Multer deve restringir uploads apenas para formatos de imagem (PNG, JPG, WEBP) com limite rígido de 5MB.
*   **Manutenibilidade:** O código deve seguir princípios de Clean Code. O Frontend deve ser componentizado (ex: `MapViewer.vue`, `AdminPanel.vue`, `PinModal.vue`). O Backend deve separar responsabilidades em `/routes`, `/controllers`, `/models` e `/middlewares`.

---

## 4. Estrutura de Resposta Esperada da IA
Por favor, gere a solução completa seguindo esta ordem estrita:

1.  **Estrutura de Pastas:** Apresente a árvore de diretórios do projeto (separando `frontend` e `backend`).
2.  **Backend (Node/Express/MongoDB):**
    *   Código do Modelo Mongoose (`Pin.js`).
    *   Código do Middleware de Segurança (`auth.js`) e Upload (`upload.js`).
    *   Código do Controller e Rotas.
    *   Código do `server.js`.
3.  **Frontend (Vue 3/Leaflet):**
    *   Código de Configuração do Leaflet para mapas estáticos (`MapViewer.vue`).
    *   Código de Integração do Admin (captura de clique X/Y + formulário).
    *   Código do Serviço de API (Axios ou Fetch) para integração com o backend.
4.  **Instruções Finais:** Comandos de terminal necessários para instalar as dependências e iniciar a aplicação simultaneamente em ambiente local.


## 5. Estrutura de Mapas
Atualmente eu tenho somente o mapa principal da home, o mapa Medieval, mas já desenvolva o codigo para por estante funcionar no seguinte fluxo:

1. Quando a pessoa clicar no pin de Inferno, Purgatorio ou Paraiso, o front passa por uma animação suavel como se estivesse chegando perto ate entrar no pin e renderiza o mapa principal do pin selecionado(dos 3 citados)
2. Dentro de cada mapa desses 3 citados, vão haver camadas, onde se a pessoa interagir com uma camada, novamente o mapa foca nele como se estivesse entrando, e renderiza agora o mapa da camada, todos esses mapas terão pins que o admin vai criar, igual no mapa principal
3. Mapas do Prgatorio, Inferno e Paraiso, não precisam estar ligados ao mapa do mundo real, apenas o mapa medieval da home, pois esses outros mapas são fictcios, mas eles tbm devem possuer seus eixos x e y, pois o admin vai pode rmarcar pins neles tbm.
4. Uma observação importante, os pins desses 3 mundos e o fato de a pessoa eentrar uma das camadas dos mundos, fazem essa imersão são pre cadastrados e fixos, o admin não pode mexer, apenas os pins de pontos da historia e curiosidades podem ser cadastrados
5. Lembrando que, deve haver um botão no que permite a renderização de uma mapa normal, do mundo real, sem ser o da era medival, realmente atual, que o admin tbm pode por pins, da mesma forma