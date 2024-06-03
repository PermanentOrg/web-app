import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChecklistComponent } from './user-checklist.component';

describe('UserChecklistComponent', () => {
  let component: UserChecklistComponent;
  let fixture: ComponentFixture<UserChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserChecklistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
