import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { ArchiveSelectorComponent } from './archive-selector.component';
import { ArchiveSmallComponent } from '@core/components/archive-small/archive-small.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';

const archiveResponseData = require('@root/test/responses/archive.get.multiple.success.json');

describe('ArchiveSelectorComponent', () => {
  let component: ArchiveSelectorComponent;
  let fixture: ComponentFixture<ArchiveSelectorComponent>;

  const archiveResponse = new ArchiveResponse(archiveResponseData);
  const archives = archiveResponse.getArchiveVOs();
  const currentArchive = archives.pop();

  beforeEach(async(() => {
    const config = Testing.BASE_TEST_CONFIG;

    config.declarations.push(ArchiveSelectorComponent);
    config.declarations.push(ArchiveSmallComponent);
    config.declarations.push(BgImageSrcDirective);

    TestBed.configureTestingModule(config)
    .compileComponents();
  }));

  beforeEach(() => {

    const accountService = TestBed.get(AccountService) as AccountService;
    accountService.setArchive(currentArchive);

    fixture = TestBed.createComponent(ArchiveSelectorComponent);
    component = fixture.componentInstance;
    component.archives = archives;
    fixture.detectChanges();
  });

  afterEach(() => {
    const accountService = TestBed.get(AccountService) as AccountService;
    accountService.clearArchive();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct number of archives listed', () => {
    expect(component.archives.length).toEqual(archives.length);

    const element = fixture.debugElement.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.archive-list pr-archive-small').length).toEqual(component.archives.length);
  });
});
