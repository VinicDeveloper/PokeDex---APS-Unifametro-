import { HttpErrorResponse } from '@angular/common/http';
import { FichaPokemon, NamedApiResource, Pokemon, PokemonResumo, PokemonSpecies } from './pokemon.model';

const SPRITES =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

/** Valor máximo de um atributo base, usado para calcular o tamanho das barras. */
export const STAT_MAXIMO = 255;

const TIPOS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  ice: 'Gelo',
  fighting: 'Lutador',
  poison: 'Venenoso',
  ground: 'Terrestre',
  flying: 'Voador',
  psychic: 'Psíquico',
  bug: 'Inseto',
  rock: 'Pedra',
  ghost: 'Fantasma',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  fairy: 'Fada',
  stellar: 'Estelar',
  unknown: 'Desconhecido',
};

const STATS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque Esp.',
  'special-defense': 'Defesa Esp.',
  speed: 'Velocidade',
};

/** Extrai o id numérico de uma URL como https://pokeapi.co/api/v2/pokemon/25/ */
export function idDaUrl(url: string): number {
  const partes = url.split('/').filter(Boolean);
  return Number(partes[partes.length - 1]);
}

/** 25 -> "#0025" */
export function formatarNumero(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

/** "mr-mime" -> "Mr Mime" */
export function formatarNome(nome: string): string {
  return nome
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export function imagemOficial(id: number): string {
  return `${SPRITES}/${id}.png`;
}

export function traduzirTipo(chave: string): string {
  return TIPOS[chave] ?? formatarNome(chave);
}

export function traduzirStat(chave: string): string {
  return STATS[chave] ?? formatarNome(chave);
}

export function paraResumo(item: NamedApiResource): PokemonResumo {
  const id = idDaUrl(item.url);
  return { id, nome: item.name, imagem: imagemOficial(id) };
}

/** Limpa quebras de linha e caracteres de controle dos textos da Pokédex. */
export function limparTexto(texto: string): string {
  return texto.replace(/[\f\n\r\u00ad]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Converte a resposta da API no modelo usado pela página de detalhes. */
export function montarFicha(pokemon: Pokemon, especie: PokemonSpecies | null): FichaPokemon {
  const artwork = pokemon.sprites.other?.['official-artwork'];
  const stats = pokemon.stats.map((s) => ({
    chave: s.stat.name,
    nome: traduzirStat(s.stat.name),
    valor: s.base_stat,
    percentual: Math.min(100, Math.round((s.base_stat / STAT_MAXIMO) * 100)),
  }));

  const registros = especie?.flavor_text_entries.filter((f) => f.language.name === 'en') ?? [];
  const ultimoRegistro = registros[registros.length - 1];
  const genero = especie?.genera.find((g) => g.language.name === 'en')?.genus ?? null;

  return {
    id: pokemon.id,
    numero: formatarNumero(pokemon.id),
    nome: formatarNome(pokemon.name),
    genero,
    registro: ultimoRegistro ? limparTexto(ultimoRegistro.flavor_text) : null,
    tipos: [...pokemon.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => ({ chave: t.type.name, nome: traduzirTipo(t.type.name) })),
    alturaM: pokemon.height / 10,
    pesoKg: pokemon.weight / 10,
    habilidades: pokemon.abilities.map((a) => ({
      nome: formatarNome(a.ability.name),
      oculta: a.is_hidden,
    })),
    stats,
    totalStats: stats.reduce((soma, s) => soma + s.valor, 0),
    imagem: artwork?.front_default ?? pokemon.sprites.front_default,
    imagemShiny: artwork?.front_shiny ?? pokemon.sprites.front_shiny,
  };
}

/** Traduz um erro HTTP em uma mensagem compreensível para o usuário. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 404) return 'Pokémon não encontrado no banco de dados.';
    if (erro.status === 0) return 'Sem conexão com a PokéAPI. Verifique sua internet e tente novamente.';
    return `A PokéAPI respondeu com erro ${erro.status}. Tente novamente em instantes.`;
  }
  return 'Ocorreu um erro inesperado ao consultar a Pokédex.';
}
