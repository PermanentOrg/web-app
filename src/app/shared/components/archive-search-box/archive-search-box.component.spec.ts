import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveSearchBoxComponent } from './archive-search-box.component';

describe('ArchiveSearchBoxComponent', () => {
  let component: ArchiveSearchBoxComponent;
  let fixture: ComponentFixture<ArchiveSearchBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchiveSearchBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveSearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
