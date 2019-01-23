import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPledgeComponent } from './new-pledge.component';

describe('NewPledgeComponent', () => {
  let component: NewPledgeComponent;
  let fixture: ComponentFixture<NewPledgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPledgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPledgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
