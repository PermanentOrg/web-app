import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaseProgressComponent } from './phase-progress.component';

describe('PhaseProgressComponent', () => {
  let component: PhaseProgressComponent;
  let fixture: ComponentFixture<PhaseProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
