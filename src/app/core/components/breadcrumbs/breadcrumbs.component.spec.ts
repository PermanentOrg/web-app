import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { BreadcrumbsComponent } from '@core/components/breadcrumbs/breadcrumbs.component';
import { DataService } from '@shared/services/data/data.service';
import { CoreModule } from '@core/core.module';
import { Router } from '@angular/router';
import { FolderVO } from '@root/app/models';

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let dataService: DataService;

  async function init(currentUrl?: string) {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.declarations.push(BreadcrumbsComponent);
    config.providers.push(DataService);

    config.providers.push({
      provide: Router,
      useValue: {
        routerState: {
          snapshot: {
            url: currentUrl || '/'
          }
        }
      }
    });

    await TestBed.configureTestingModule(config).compileComponents();

    dataService = TestBed.get(DataService);
    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await init();
    expect(component).toBeTruthy();
  });

  it('should update the current folder when dataService is updated', async () => {
    await init();
    expect(component.currentFolder).toBeFalsy();
    const testFolder = new FolderVO({
      pathAsText: ['test'],
      pathAsArchiveNbr: ['test'],
      pathAsFolder_linkId: [1]
    });
    dataService.setCurrentFolder(testFolder);
    expect(component.currentFolder).toEqual(testFolder);
    dataService.setCurrentFolder();
    expect(component.currentFolder).toBeFalsy();
  });

  it('should create the proper amount of breadcrumbs with proper links', async () => {
    await init();
    const testFolder = new FolderVO({
      pathAsArchiveNbr: ['test1', 'test2', 'test3'],
      pathAsText: ['My Files', 'Test Folder Parent', 'Test Folder'],
      pathAsFolder_linkId: [1, 2, 3]
    });
    dataService.setCurrentFolder(testFolder);
    expect(component.breadcrumbs.length).toBe(testFolder.pathAsArchiveNbr.length);
    const expectedUrl = `/myfiles/${testFolder.pathAsArchiveNbr[1]}/${testFolder.pathAsFolder_linkId[1]}`;
    expect(component.breadcrumbs[1].routerPath).toEqual(expectedUrl);
  });

  it('should link to My Files for folders in My Files', async () => {
    await init('/myfiles');
    const testFolder = new FolderVO({
      pathAsArchiveNbr: ['test1', 'test2', 'test3'],
      pathAsText: ['My Files', 'Test Folder Parent', 'Test Folder'],
      pathAsFolder_linkId: [1, 2, 3]
    });
    (TestBed.get(DataService) as DataService).setCurrentFolder(testFolder);
    expect(component.breadcrumbs[0].routerPath).toEqual('/myfiles');
    expect(component.breadcrumbs[1].routerPath).toContain('/myfiles');
  });

  it('should link to Apps for folders in Apps', async () => {
    await init('/apps');
    const testFolder = new FolderVO({
      pathAsArchiveNbr: ['test1', 'test2', 'test3'],
      pathAsText: ['Apps', 'Facebook', 'Everything'],
      pathAsFolder_linkId: [1, 2, 3]
    });
    (TestBed.get(DataService) as DataService).setCurrentFolder(testFolder);
    expect(component.breadcrumbs[0].routerPath).toEqual('/apps');
    expect(component.breadcrumbs[1].routerPath).toContain('/apps');
  });

  it('should link to Shares for folders in Shares', async () => {
    await init('/shares');
    const testFolder = new FolderVO({
      pathAsArchiveNbr: ['test1', 'test2', 'test3'],
      pathAsText: ['Shares', 'Archive Name', 'Shared Folder'],
      pathAsFolder_linkId: [1, 2, 3]
    });
    (TestBed.get(DataService) as DataService).setCurrentFolder(testFolder);
    expect(component.breadcrumbs[0].routerPath).toEqual('/shares');
    expect(component.breadcrumbs[1].routerPath).toContain('/shares');
  });
});
