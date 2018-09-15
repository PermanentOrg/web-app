import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareByMeComponent } from './share-by-me.component';

describe('ShareByMeComponent', () => {
  let component: ShareByMeComponent;
  let fixture: ComponentFixture<ShareByMeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareByMeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareByMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
