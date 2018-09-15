import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareWithMeComponent } from './share-with-me.component';

describe('ShareWithMeComponent', () => {
  let component: ShareWithMeComponent;
  let fixture: ComponentFixture<ShareWithMeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareWithMeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareWithMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
