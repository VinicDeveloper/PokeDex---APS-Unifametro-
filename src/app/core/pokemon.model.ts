/**
 * Interfaces TypeScript que descrevem as respostas da PokéAPI (v2)
 * e os modelos de exibição usados pelos componentes.
 */

/** Referência genérica usada pela PokéAPI: { name, url }. */
export interface NamedApiResource {
  name: string;
  url: string;
}

/** Resposta de GET /pokemon?limit=&offset= */
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

/** Resposta (resumida) de GET /pokemon/{nome-ou-id} */
export interface Pokemon {
  id: number;
  name: string;
  height: number; // em decímetros
  weight: number; // em hectogramas
  types: { slot: number; type: NamedApiResource }[];
  abilities: { ability: NamedApiResource; is_hidden: boolean; slot: number }[];
  stats: { base_stat: number; effort: number; stat: NamedApiResource }[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  species: NamedApiResource;
}

/** Resposta (resumida) de GET /pokemon-species/{id} — usada para o registro da Pokédex. */
export interface PokemonSpecies {
  id: number;
  name: string;
  genera: { genus: string; language: NamedApiResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedApiResource;
    version: NamedApiResource;
  }[];
}

/** Item exibido no cartão da listagem. */
export interface PokemonResumo {
  id: number;
  nome: string;
  imagem: string;
}

/** Modelo de exibição da página de detalhes. */
export interface FichaPokemon {
  id: number;
  numero: string;
  nome: string;
  genero: string | null;
  registro: string | null;
  tipos: { chave: string; nome: string }[];
  alturaM: number;
  pesoKg: number;
  habilidades: { nome: string; oculta: boolean }[];
  stats: { chave: string; nome: string; valor: number; percentual: number }[];
  totalStats: number;
  imagem: string | null;
  imagemShiny: string | null;
}

/** Estados possíveis de uma tela que depende da API. */
export type EstadoConsulta<T> =
  | { status: 'carregando' }
  | { status: 'erro'; mensagem: string }
  | { status: 'ok'; dados: T };
