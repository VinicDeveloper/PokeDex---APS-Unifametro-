# PokéDex — Angular na Prática

Aplicação desenvolvida para a disciplina **DAC (Análise e Aplicação de Frameworks/Libs Frontend)** — Unifametro.
Uma Pokédex inspirada nos terminais do anime, feita em **Angular 22** e alimentada pela [PokéAPI](https://pokeapi.co/docs/v2).

## Funcionalidades

- **Listagem** paginada (20 por página) em cartões com imagem, número e nome.
- **Busca** por nome (parcial) ou número, com `debounceTime` e `switchMap`.
- **Detalhes** em `/pokemon/:name`: tipos, altura, peso, habilidades, estatísticas base, arte normal/shiny e o registro da Pokédex (com leitura em voz alta).
- **Estados de interface**: carregando, erro (404 / sem conexão) e nenhum resultado.

## Estrutura

```
src/app/
  core/
    pokemon.service.ts      # acesso à API (HttpClient)
    pokemon.model.ts        # interfaces TypeScript
    pokemon.utils.ts        # conversões e traduções (tipos, atributos, erros)
  features/
    pokemon-list/           # listagem + busca + paginação
    pokemon-card/           # cartão reutilizável
    pokemon-detail/         # detalhes de um Pokémon
  app.routes.ts             # rotas: '' e 'pokemon/:name' (lazy loading)
  app.config.ts             # providers (provideHttpClient, provideRouter)
```

## Recursos do Angular utilizados

Componentes standalone · signals (`signal`, `computed`, `linkedSignal`, `input`) · novo controle de fluxo (`@if`, `@for`, `@let`) ·
injeção de dependências com `inject()` · `HttpClient` + RxJS (`debounceTime`, `switchMap`, `catchError`, `shareReplay`) ·
Angular Router com parâmetros, *query params* e *lazy loading* · `[(ngModel)]` (FormsModule) · testes com Vitest.

## Endpoints da PokéAPI

| Finalidade | Método | Endpoint |
|---|---|---|
| Listar Pokémon (paginado) | GET | `https://pokeapi.co/api/v2/pokemon?limit=20&offset=0` |
| Detalhar um Pokémon | GET | `https://pokeapi.co/api/v2/pokemon/{nome-ou-id}` |
| Registro da Pokédex e categoria | GET | `https://pokeapi.co/api/v2/pokemon-species/{id}` |

## Como executar

1. Instale o Node.js (versão LTS) e o Angular CLI: `npm install -g @angular/cli`
2. Clone o repositório: `git clone [link do repositório]`
3. Entre na pasta do projeto: `cd pokedex`
4. Instale as dependências: `npm install`
5. Inicie o servidor de desenvolvimento: `ng serve`
6. Abra `http://localhost:4200` no navegador.

Outros comandos: `ng build` (versão de produção) e `ng test` (testes unitários).
