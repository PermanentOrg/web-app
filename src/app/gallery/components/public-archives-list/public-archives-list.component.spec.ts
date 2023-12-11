/* @format */
import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { Router } from '@angular/router';
import { ArchiveVO } from '../../../models/archive-vo';
import { GalleryModule } from '../../gallery.module';
import { PublicArchivesListComponent } from './public-archives-list.component';

const mockAccountService = {
  getAllPublicArchives: () => Promise.resolve([]),
};

describe('PublicArchivesComponent', () => {
  let shallow: Shallow<PublicArchivesListComponent>;
  let messageShown = false;

  beforeEach(async () => {
    shallow = new Shallow(PublicArchivesListComponent, GalleryModule)
      .mock(AccountService, mockAccountService)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      })
      .mock(Router, {
        navigate: () => {
          return Promise.resolve(true);
        },
      });
  });

  it('should create', async () => {
    const { instance } = await shallow.render();
    expect(instance).toBeTruthy();
  });

  it('should show all the public archives of the user', async () => {
    const { instance, fixture, find } = await shallow.render();
    instance.publicArchives = [
      new ArchiveVO({ archiveNbr: 1, name: 'test', public: 1 }),
      new ArchiveVO({ archiveNbr: 2, name: 'test2', public: 1 }),
    ];
    fixture.detectChanges();

    const archives = find('.public-archive');

    expect(archives.length).toEqual(2);
  });

  it('should display the "no archives" element', async () => {
    const { instance, fixture, find } = await shallow.render();
    instance.publicArchives = [];
    fixture.detectChanges();

    const element = find('.no-archives');
    expect(element.nativeElement).toBeTruthy();
  });

  it('should redirect the user to the archive when clicking on it', async () => {
    const { instance, fixture, inject } = await shallow.render();

    const router = inject(Router);
    const archive = new ArchiveVO({ archiveNbr: 1, name: 'test', public: 1 });
    instance.goToArchive(archive);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith([
      '/p/archive',
      archive.archiveNbr,
    ]);
  });
});
