import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { ArchiveSelectorComponent } from './archive-selector.component';
import { ArchiveSmallComponent } from '@core/components/archive-small/archive-small.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';

describe('ArchiveSelectorComponent', () => {
  let component: ArchiveSelectorComponent;
  let fixture: ComponentFixture<ArchiveSelectorComponent>;

  beforeEach(async(() => {
    const config = Testing.BASE_TEST_CONFIG;

    config.declarations.push(ArchiveSelectorComponent);
    config.declarations.push(ArchiveSmallComponent);
    config.declarations.push(BgImageSrcDirective);

    TestBed.configureTestingModule(config)
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
