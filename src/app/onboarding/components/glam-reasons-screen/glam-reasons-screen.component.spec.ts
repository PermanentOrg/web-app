import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlamReasonsScreenComponent } from './glam-reasons-screen.component';

describe('GlamReasonsScreenComponent', () => {
  let component: GlamReasonsScreenComponent;
  let fixture: ComponentFixture<GlamReasonsScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlamReasonsScreenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlamReasonsScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
