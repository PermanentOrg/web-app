import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticMapComponent } from './static-map.component';

describe('StaticMapComponent', () => {
  let component: StaticMapComponent;
  let fixture: ComponentFixture<StaticMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
