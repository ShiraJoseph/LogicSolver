import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureGridComponent } from './feature-grid.component';

describe('FeatureGridComponent', () => {
  let component: FeatureGridComponent;
  let fixture: ComponentFixture<FeatureGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
