import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveCreationStartScreenComponent } from './archive-creation-start-screen.component';

describe('ArchiveCreationStartScreenComponent', () => {
  let component: ArchiveCreationStartScreenComponent;
  let fixture: ComponentFixture<ArchiveCreationStartScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveCreationStartScreenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArchiveCreationStartScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
