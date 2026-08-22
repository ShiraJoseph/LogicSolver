import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BaseDirective} from './base.directive';

/** A bare component that exists only to instantiate the directive under test. */
@Component({selector: 'app-test-base', template: ''})
class TestBaseComponent extends BaseDirective {
}

describe('BaseDirective', () => {
  let component: TestBaseComponent;
  let fixture: ComponentFixture<TestBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestBaseComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TestBaseComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
