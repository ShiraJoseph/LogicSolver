import { TestBed } from '@angular/core/testing';

import { TileService } from './tile.service';

describe('TileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TileService = TestBed.inject(TileService);
    expect(service).toBeTruthy();
  });
});
