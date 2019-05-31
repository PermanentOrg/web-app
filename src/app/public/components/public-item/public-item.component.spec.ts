import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicItemComponent } from './public-item.component';

describe('PublicItemComponent', () => {
  let component: PublicItemComponent;
  let fixture: ComponentFixture<PublicItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
