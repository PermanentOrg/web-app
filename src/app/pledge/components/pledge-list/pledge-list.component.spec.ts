import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PledgeListComponent } from './pledge-list.component';

describe('PledgeListComponent', () => {
  let component: PledgeListComponent;
  let fixture: ComponentFixture<PledgeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PledgeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PledgeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
