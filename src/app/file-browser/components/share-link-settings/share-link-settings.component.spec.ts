import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareLinkSettingsComponent } from './share-link-settings.component';

describe('ShareLinkSettingsComponent', () => {
  let component: ShareLinkSettingsComponent;
  let fixture: ComponentFixture<ShareLinkSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareLinkSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShareLinkSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
