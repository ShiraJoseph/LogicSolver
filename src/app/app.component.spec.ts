import {TestBed} from '@angular/core/testing';

import {AppComponent} from './app.component';
import {GRID_SEED} from './store/grid.token';
import {MOCK_SMALL_GRID_SEED} from './mocks/grid.mock';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the grid', async () => {
    const fixture = TestBed.createComponent(AppComponent);

    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-grid')).not.toBeNull();
  });
});
