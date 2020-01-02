import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqvLibComponent } from './sqv-lib.component';

describe('SqvLibComponent', () => {
  let component: SqvLibComponent;
  let fixture: ComponentFixture<SqvLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqvLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqvLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
