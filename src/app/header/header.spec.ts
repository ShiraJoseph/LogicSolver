import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';
import { TileType } from '../../services/tile.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    component.tile = { text: '', cols: 1, rows: 1, type: TileType.TOP_FEATURE_HEADER };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
