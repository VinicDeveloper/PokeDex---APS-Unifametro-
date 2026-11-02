import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Pokédex · Banco de dados',
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list').then((m) => m.PokemonList),
  },
  {
    path: 'pokemon/:name',
    title: 'Pokédex · Registro',
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-detail').then((m) => m.PokemonDetail),
  },
  { path: '**', redirectTo: '' },
];
