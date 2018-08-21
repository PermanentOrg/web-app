import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPromptComponent } from './edit-prompt.component';

describe('EditPromptComponent', () => {
  let component: EditPromptComponent;
  let fixture: ComponentFixture<EditPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
