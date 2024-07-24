import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlamPendingArchivesComponent } from './glam-pending-archives.component';

describe('GlamPendingArchivesComponent', () => {
  let component: GlamPendingArchivesComponent;
  let fixture: ComponentFixture<GlamPendingArchivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlamPendingArchivesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlamPendingArchivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
