import { TestBed } from '@angular/core/testing';

import { StoreService } from './store.service';

describe('DataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreService = TestBed.inject(StoreService);
    expect(service).toBeTruthy();
  });
});
