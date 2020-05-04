import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDragRootComponent } from './file-drag-root.component';

describe('FileDragRootComponent', () => {
  let component: FileDragRootComponent;
  let fixture: ComponentFixture<FileDragRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDragRootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDragRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
