import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlamGoalsScreenComponent } from './glam-goals-screen.component';

describe('GlamGoalsScreenComponent', () => {
  let component: GlamGoalsScreenComponent;
  let fixture: ComponentFixture<GlamGoalsScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlamGoalsScreenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlamGoalsScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
