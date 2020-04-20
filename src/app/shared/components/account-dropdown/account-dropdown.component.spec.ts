import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDropdownComponent } from './account-dropdown.component';

describe('AccountDropdownComponent', () => {
  let component: AccountDropdownComponent;
  let fixture: ComponentFixture<AccountDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
