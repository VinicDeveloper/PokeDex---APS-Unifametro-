import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { EstadoConsulta, FichaPokemon } from '../../core/pokemon.model';
import { PokemonService } from '../../core/pokemon.service';
import { formatarNumero, mensagemDeErro, montarFicha } from '../../core/pokemon.utils';

/** Página de detalhes: rota /pokemon/:name */
@Component({
  selector: 'app-pokemon-detail',
  imports: [RouterLink],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.css',
})
export class PokemonDetail {
  private service = inject(PokemonService);
  private titulo = inject(Title);

  /** Parâmetro :name da rota, recebido como input(). */
  readonly name = input.required<string>();

  protected readonly shiny = signal(false);
  protected readonly falando = signal(false);
  protected readonly vozDisponivel = typeof window !== 'undefined' && 'speechSynthesis' in window;
  private readonly tentativa = signal(0);

  protected readonly voltarQueryParams = computed(() => {
    const { busca, pagina } = this.service.ultimaConsulta();
    return { busca: busca || null, pagina: pagina > 1 ? pagina : null };
  });

  protected readonly estado = toSignal(
    combineLatest([toObservable(this.name), toObservable(this.tentativa)]).pipe(
      switchMap(([nome]) =>
        this.service.detalhar(nome).pipe(
          // A espécie traz o texto da Pokédex; se falhar, o restante da ficha continua aparecendo.
          switchMap((pokemon) =>
            this.service.especie(pokemon.species.url).pipe(
              catchError(() => of(null)),
              map((especie) => montarFicha(pokemon, especie)),
            ),
          ),
          map((dados): EstadoConsulta<FichaPokemon> => ({ status: 'ok', dados })),
          catchError((erro) => of({ status: 'erro', mensagem: mensagemDeErro(erro) } as const)),
          startWith({ status: 'carregando' } as const),
        ),
      ),
    ),
    { initialValue: { status: 'carregando' } as EstadoConsulta<FichaPokemon> },
  );

  protected readonly formatarNumero = formatarNumero;

  constructor() {
    effect(() => {
      const e = this.estado();
      if (e.status === 'ok') this.titulo.setTitle(`${e.dados.numero} ${e.dados.nome} · Pokédex`);
    });

    // Ao trocar de Pokémon, volta para a arte normal e interrompe a leitura em voz alta.
    effect(() => {
      this.name();
      this.shiny.set(false);
      this.pararVoz();
    });

    inject(DestroyRef).onDestroy(() => this.pararVoz());
  }

  protected tentarNovamente(): void {
    this.tentativa.update((n) => n + 1);
  }

  /** Lê o registro em voz alta, como a Pokédex do anime. */
  protected ouvir(ficha: FichaPokemon): void {
    if (!this.vozDisponivel) return;
    if (this.falando()) {
      this.pararVoz();
      return;
    }
    const texto = [ficha.nome, ficha.genero, ficha.registro].filter(Boolean).join('. ');
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'en-US';
    fala.rate = 0.95;
    fala.onend = () => this.falando.set(false);
    fala.onerror = () => this.falando.set(false);
    this.falando.set(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(fala);
  }

  private pararVoz(): void {
    if (this.vozDisponivel) window.speechSynthesis.cancel();
    this.falando.set(false);
  }
}
