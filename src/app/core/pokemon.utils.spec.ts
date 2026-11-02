import { HttpErrorResponse } from '@angular/common/http';
import { Pokemon } from './pokemon.model';
import { formatarNumero, idDaUrl, mensagemDeErro, montarFicha } from './pokemon.utils';

describe('pokemon.utils', () => {
  it('extrai o id da URL da PokéAPI', () => {
    expect(idDaUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('formata o número com quatro dígitos', () => {
    expect(formatarNumero(25)).toBe('#0025');
  });

  it('converte altura (dm) para metros e peso (hg) para quilos', () => {
    const pokemon: Pokemon = {
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      types: [{ slot: 1, type: { name: 'electric', url: '' } }],
      abilities: [],
      stats: [{ base_stat: 90, effort: 2, stat: { name: 'speed', url: '' } }],
      sprites: { front_default: null, front_shiny: null },
      species: { name: 'pikachu', url: '' },
    };
    const ficha = montarFicha(pokemon, null);
    expect(ficha.alturaM).toBe(0.4);
    expect(ficha.pesoKg).toBe(6);
    expect(ficha.tipos).toEqual([{ chave: 'electric', nome: 'Elétrico' }]);
    expect(ficha.stats[0]).toEqual({ chave: 'speed', nome: 'Velocidade', valor: 90, percentual: 35 });
  });

  it('mostra mensagem de "não encontrado" para erro 404', () => {
    expect(mensagemDeErro(new HttpErrorResponse({ status: 404 }))).toBe(
      'Pokémon não encontrado no banco de dados.',
    );
  });

  it('mostra mensagem de falta de conexão para erro de rede', () => {
    expect(mensagemDeErro(new HttpErrorResponse({ status: 0 }))).toContain('Sem conexão');
  });
});
