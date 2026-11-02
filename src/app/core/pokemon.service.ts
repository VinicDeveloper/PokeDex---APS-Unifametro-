import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import {
  NamedApiResource,
  Pokemon,
  PokemonListResponse,
  PokemonResumo,
  PokemonSpecies,
} from './pokemon.model';
import { paraResumo } from './pokemon.utils';

/**
 * Único ponto de acesso à PokéAPI. Os componentes nunca usam o HttpClient
 * diretamente: eles pedem os dados a este serviço (injeção de dependências).
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  /** Índice com todos os nomes, baixado uma única vez e reaproveitado nas buscas. */
  private indice$?: Observable<NamedApiResource[]>;

  /** Estado compartilhado: última página/busca da listagem (para o botão "voltar"). */
  readonly ultimaConsulta = signal<{ busca: string; pagina: number }>({ busca: '', pagina: 1 });

  listar(limit = 20, offset = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(
      `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`,
    );
  }

  detalhar(nome: string | number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${String(nome).trim().toLowerCase()}`);
  }

  /** Busca a espécie (registro da Pokédex e categoria) a partir da URL vinda do detalhe. */
  especie(url: string): Observable<PokemonSpecies> {
    return this.http.get<PokemonSpecies>(url);
  }

  /** Busca por parte do nome ou pelo número exato (ex.: "pika", "25", "#025"). */
  buscar(termo: string): Observable<PokemonResumo[]> {
    const texto = termo.trim().toLowerCase();
    const numero = texto.replace(/^#/, '').replace(/^0+(?=\d)/, '');
    return this.indice().pipe(
      map((lista) =>
        lista
          .map(paraResumo)
          .filter((p) => p.nome.includes(texto) || String(p.id) === numero),
      ),
    );
  }

  private indice(): Observable<NamedApiResource[]> {
    this.indice$ ??= this.http
      .get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=2000&offset=0`)
      .pipe(
        map((r) => r.results),
        shareReplay(1),
      );
    return this.indice$;
  }
}
