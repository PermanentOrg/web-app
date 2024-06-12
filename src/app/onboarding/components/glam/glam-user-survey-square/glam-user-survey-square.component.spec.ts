import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlamUserSurveySquareComponent } from './glam-user-survey-square.component';

describe('GlamUserSurveySquareComponent', () => {
  let component: GlamUserSurveySquareComponent;
  let fixture: ComponentFixture<GlamUserSurveySquareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlamUserSurveySquareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlamUserSurveySquareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
