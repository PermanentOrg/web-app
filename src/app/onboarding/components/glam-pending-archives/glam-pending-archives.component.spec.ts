/* @format */
import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models/index';
import { OnboardingModule } from '../../onboarding.module';
import { GlamPendingArchivesComponent } from './glam-pending-archives.component';

const mockAccountService = {
  getAccount: () => {
    return {
      fullName: 'John Doe',
    };
  },
};

describe('GlamPendingArchivesComponent', () => {
  let shallow: Shallow<GlamPendingArchivesComponent>;

  beforeEach(async () => {
    shallow = new Shallow(GlamPendingArchivesComponent, OnboardingModule).mock(
      AccountService,
      mockAccountService,
    );
  });

  it('should create the component', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should initialize accountName from AccountService', async () => {
    const { instance } = await shallow.render();

    expect(instance.accountName).toBe('John Doe');
  });

  it('should render the list of pending archives', async () => {
    const pendingArchives: ArchiveVO[] = [
      new ArchiveVO({ archiveId: 1, fullName: 'Archive 1' }),
      new ArchiveVO({ archiveId: 2, fullName: 'Archive 2' }),
    ];

    const { find } = await shallow.render({
      bind: { pendingArchives },
    });

    const archiveElements = find('pr-pending-archive');

    expect(archiveElements.length).toBe(2);
  });

  it('should update selectedArchive when selectArchive is called', async () => {
    const { instance } = await shallow.render();
    const archive: ArchiveVO = new ArchiveVO({
      archiveId: 1,
      fullName: 'Test Archive',
    });

    instance.selectArchive(archive);

    expect(instance.selectedArchive).toBe(archive);
  });

  it('should emit createNewArchiveOutput when createNewArchive is called', async () => {
    const { instance, outputs } = await shallow.render();
    instance.createNewArchive();

    expect(outputs.createNewArchiveOutput.emit).toHaveBeenCalled();
  });

  it('should emit nextOutput with selected archive when next is called', async () => {
    const { instance, outputs } = await shallow.render();
    const selectedArchive: ArchiveVO = new ArchiveVO({
      archiveId: 1,
      fullName: 'Test Archive',
    });

    instance.selectedArchive = selectedArchive;
    instance.next();

    expect(outputs.nextOutput.emit).toHaveBeenCalledWith(selectedArchive);
  });
});
