import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfileEditTopicComponent } from './profile-edit-topic.component';

describe('ProfileEditTopicComponent', () => {
  let component: ProfileEditTopicComponent;
  let fixture: ComponentFixture<ProfileEditTopicComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileEditTopicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEditTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
