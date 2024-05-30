import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectArchiveTypeScreenComponent } from './select-archive-type-screen.component';

describe('SelectArchiveTypeScreenComponent', () => {
  let component: SelectArchiveTypeScreenComponent;
  let fixture: ComponentFixture<SelectArchiveTypeScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectArchiveTypeScreenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectArchiveTypeScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
