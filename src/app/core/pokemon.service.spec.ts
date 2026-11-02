import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PokemonService } from './pokemon.service';

describe('PokemonService', () => {
  let service: PokemonService;
  let http: HttpTestingController;
  const API = 'https://pokeapi.co/api/v2';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PokemonService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista 20 Pokémon por padrão a partir do offset 0', () => {
    service.listar().subscribe();
    const req = http.expectOne(`${API}/pokemon?limit=20&offset=0`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 0, next: null, previous: null, results: [] });
  });

  it('usa limit e offset informados na paginação', () => {
    service.listar(20, 40).subscribe();
    http.expectOne(`${API}/pokemon?limit=20&offset=40`).flush({ count: 0, next: null, previous: null, results: [] });
  });

  it('detalha um Pokémon pelo nome em minúsculas', () => {
    service.detalhar('  Pikachu ').subscribe();
    http.expectOne(`${API}/pokemon/pikachu`).flush({});
  });

  it('busca por parte do nome e por número, baixando o índice uma única vez', () => {
    const indice = {
      count: 3,
      next: null,
      previous: null,
      results: [
        { name: 'pichu', url: `${API}/pokemon/172/` },
        { name: 'pikachu', url: `${API}/pokemon/25/` },
        { name: 'bulbasaur', url: `${API}/pokemon/1/` },
      ],
    };

    let porNome: string[] = [];
    service.buscar('PIKA').subscribe((r) => (porNome = r.map((p) => p.nome)));
    http.expectOne(`${API}/pokemon?limit=2000&offset=0`).flush(indice);
    expect(porNome).toEqual(['pikachu']);

    let porNumero: number[] = [];
    service.buscar('#025').subscribe((r) => (porNumero = r.map((p) => p.id)));
    http.expectNone(`${API}/pokemon?limit=2000&offset=0`);
    expect(porNumero).toEqual([25]);
  });
});
