import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameArchiveScreenComponent } from './name-archive-screen.component';

describe('NameArchiveScreenComponent', () => {
  let component: NameArchiveScreenComponent;
  let fixture: ComponentFixture<NameArchiveScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameArchiveScreenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NameArchiveScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
