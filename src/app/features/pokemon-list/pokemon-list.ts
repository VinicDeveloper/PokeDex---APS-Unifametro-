import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { EstadoConsulta, PokemonResumo } from '../../core/pokemon.model';
import { PokemonService } from '../../core/pokemon.service';
import { mensagemDeErro, paraResumo } from '../../core/pokemon.utils';
import { PokemonCard } from '../pokemon-card/pokemon-card';

export const POR_PAGINA = 20;

interface PaginaDeResultados {
  itens: PokemonResumo[];
  total: number;
}

/** Listagem paginada + campo de busca. A página e a busca ficam na URL (?pagina=&busca=). */
@Component({
  selector: 'app-pokemon-list',
  imports: [FormsModule, PokemonCard],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.css',
})
export class PokemonList {
  private service = inject(PokemonService);
  private router = inject(Router);

  /** Vêm dos query params graças ao withComponentInputBinding(). */
  readonly busca = input<string | undefined>();
  readonly pagina = input(1, {
    transform: (valor: unknown) => Math.max(1, Math.floor(Number(valor)) || 1),
  });

  /** Texto digitado (ligado ao input com ngModel). Reinicia quando a URL muda. */
  protected readonly termo = linkedSignal(() => this.busca() ?? '');

  /** Incrementado pelo botão "Tentar novamente" para refazer a mesma consulta. */
  private readonly tentativa = signal(0);

  private readonly consulta = computed(() => ({
    busca: (this.busca() ?? '').trim().toLowerCase(),
    pagina: this.pagina(),
    tentativa: this.tentativa(),
  }));

  protected readonly estado = toSignal(
    toObservable(this.consulta).pipe(
      switchMap(({ busca, pagina }) =>
        this.carregar(busca, pagina).pipe(
          map((dados): EstadoConsulta<PaginaDeResultados> => ({ status: 'ok', dados })),
          catchError((erro) => of({ status: 'erro', mensagem: mensagemDeErro(erro) } as const)),
          startWith({ status: 'carregando' } as const),
        ),
      ),
    ),
    { initialValue: { status: 'carregando' } as EstadoConsulta<PaginaDeResultados> },
  );

  protected readonly totalPaginas = computed(() => {
    const e = this.estado();
    return e.status === 'ok' ? Math.max(1, Math.ceil(e.dados.total / POR_PAGINA)) : 1;
  });

  constructor() {
    // Busca com debounceTime: só atualiza a URL 400 ms depois que o usuário para de digitar.
    toObservable(this.termo)
      .pipe(
        map((t) => t.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        filter((t) => t.toLowerCase() !== (this.busca() ?? '').trim().toLowerCase()),
        takeUntilDestroyed(),
      )
      .subscribe((t) => this.navegar({ busca: t || null, pagina: null }));

    // Guarda a consulta atual no serviço para o botão "voltar" da página de detalhes.
    effect(() => {
      const { busca, pagina } = this.consulta();
      this.service.ultimaConsulta.set({ busca, pagina });
    });
  }

  protected irParaPagina(pagina: number): void {
    this.navegar({ pagina: pagina > 1 ? pagina : null }, false);
  }

  protected tentarNovamente(): void {
    this.tentativa.update((n) => n + 1);
  }

  protected limparBusca(): void {
    this.termo.set('');
    this.navegar({ busca: null, pagina: null });
  }

  private navegar(queryParams: Record<string, string | number | null>, substituir = true): void {
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: substituir });
  }

  private carregar(busca: string, pagina: number): Observable<PaginaDeResultados> {
    const offset = (pagina - 1) * POR_PAGINA;
    if (!busca) {
      return this.service
        .listar(POR_PAGINA, offset)
        .pipe(map((r) => ({ itens: r.results.map(paraResumo), total: r.count })));
    }
    return this.service
      .buscar(busca)
      .pipe(map((lista) => ({ itens: lista.slice(offset, offset + POR_PAGINA), total: lista.length })));
  }
}
