import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivePickerComponent } from './archive-picker.component';

describe('ArchivePickerComponent', () => {
  let component: ArchivePickerComponent;
  let fixture: ComponentFixture<ArchivePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
