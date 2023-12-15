
import { NgModule } from '@angular/core';
import { Shallow } from 'shallow-render';

import { ArchiveVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { PublicSettingsComponent } from './public-settings.component';

@NgModule({
  declarations: [], // components your module owns.
  imports: [], // other modules your module needs.
  providers: [ApiService], // providers available to your module.
  bootstrap: [], // bootstrap this root component.
})
class DummyModule {}

let archive: ArchiveVO;
let throwError: boolean = false;
let updatedDownload: boolean = false;
let updated: boolean = false;
const mockApiService = {
  archive: {
    update: async (data: any) => {
      if (throwError) {
        throw 'Test Error';
      }
      updated = true;
      updatedDownload = data.allowPublicDownload as boolean;
    },
  },
};

describe('PublicSettingsComponent', () => {
  let shallow: Shallow<PublicSettingsComponent>;
  async function defaultRender(a: ArchiveVO = archive) {
    return await shallow.render(
      `<pr-public-settings [archive]="archive"></pr-public-settings>`,
      {
        bind: {
          archive: a,
        },
      }
    );
  }
  beforeEach(() => {
    throwError = false;
    updatedDownload = null;
    updated = false;
    archive = {
      allowPublicDownload: true,
    } as ArchiveVO;
    shallow = new Shallow(PublicSettingsComponent, DummyModule).mock(
      ApiService,
      mockApiService
    );
  });

  it('should exist', async () => {
    const { element } = await defaultRender();

    expect(element).not.toBeNull();
  });

  describe('it should have the proper option checked by default', () => {
    it('on', async () => {
      const { element } = await defaultRender();

      expect(element.componentInstance.allowDownloadsToggle).toBeTruthy();
    });
    it('off', async () => {
      const { element } = await defaultRender({
        allowPublicDownload: false,
      } as ArchiveVO);

      expect(element.componentInstance.allowDownloadsToggle).toBeFalsy();
    });
  });

  it('should save the archive setting when changed', async () => {
    const { element } = await defaultRender();

    expect(updated).toBeFalse();
    element.componentInstance.allowDownloadsToggle = 0;
    await element.componentInstance.onAllowDownloadsChange();

    expect(updated).toBeTrue();
    expect(updatedDownload).toBeFalse();
    element.componentInstance.allowDownloadsToggle = 1;
    await element.componentInstance.onAllowDownloadsChange();

    expect(updatedDownload).toBeTrue();
  });

  it('should fail silently', async () => {
    const { element } = await defaultRender();
    throwError = true;
    element.componentInstance.allowDownloadsToggle = 0;
    await element.componentInstance.onAllowDownloadsChange();

    expect(updated).toBeFalse();
  });
});
