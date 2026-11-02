import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonResumo } from '../../core/pokemon.model';
import { formatarNome, formatarNumero } from '../../core/pokemon.utils';

/** Cartão reutilizável exibido na listagem. */
@Component({
  selector: 'app-pokemon-card',
  imports: [RouterLink],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css',
})
export class PokemonCard {
  readonly pokemon = input.required<PokemonResumo>();

  protected readonly numero = computed(() => formatarNumero(this.pokemon().id));
  protected readonly nome = computed(() => formatarNome(this.pokemon().nome));
  protected readonly imagemFalhou = signal(false);
}
