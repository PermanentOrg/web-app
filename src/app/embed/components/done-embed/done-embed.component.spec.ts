import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoneEmbedComponent } from '@auth/components/done-embed/done-embed.component';

describe('DoneEmbedComponent', () => {
  let component: DoneEmbedComponent;
  let fixture: ComponentFixture<DoneEmbedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoneEmbedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoneEmbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
