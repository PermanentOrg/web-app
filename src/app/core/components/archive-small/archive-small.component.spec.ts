import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveSmallComponent } from './archive-small.component';

describe('ArchiveSmallComponent', () => {
  let component: ArchiveSmallComponent;
  let fixture: ComponentFixture<ArchiveSmallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchiveSmallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
