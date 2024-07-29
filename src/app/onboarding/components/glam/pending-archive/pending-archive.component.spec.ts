/* @format */
import { Shallow } from 'shallow-render';
import { OnboardingModule } from '@root/app/onboarding/onboarding.module';
import { ArchiveVO } from '@models/index';
import { PendingArchiveComponent } from './pending-archive.component';

describe('PendingArchiveComponent', () => {
  let shallow: Shallow<PendingArchiveComponent>;

  beforeEach(async () => {
    shallow = new Shallow(PendingArchiveComponent, OnboardingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render({
      bind: {
        archive: { fullName: 'John Doe' },
      },
    });

    expect(instance).toBeTruthy();
  });

  it('should display the archive fullName', async () => {
    const { find } = await shallow.render({
      bind: {
        archive: {
          fullName: 'Test Archive',
          id: 1,
          role: 'access.role.viewer',
        },
      },
    });

    const fullNameElement = find('.name b');

    expect(fullNameElement.nativeElement.textContent).toContain('Test Archive');
  });

  it('should handle undefined archive input gracefully', async () => {
    const { find } = await shallow.render({
      bind: {
        archive: {},
      },
    });

    const fullNameElement = find('.name b');

    expect(fullNameElement.nativeElement.textContent).toBe('');
  });

  it('should emit acceptArchiveOutput event with the archive when acceptArchive is called', async () => {
    const archiveData = new ArchiveVO({
      fullName: 'Test Archive',
      id: 1,
      role: 'access.role.viewer',
    });
    const { instance, outputs } = await shallow.render({
      bind: {
        archive: archiveData,
      },
    });

    instance.acceptArchive(archiveData);

    expect(outputs.acceptArchiveOutput.emit).toHaveBeenCalledWith(archiveData);
  });

  it('should display the correct role name based on the role input', async () => {
    const { find } = await shallow.render({
      bind: {
        archive: {
          fullName: 'Test Archive',
          id: 1,
          accessRole: 'access.role.editor',
        },
      },
    });

    const roleElement = find('.role');
    
    expect(roleElement.nativeElement.textContent).toContain('Editor');
  });

  it('should map role key to role name correctly', async () => {
    const { instance } = await shallow.render({
      bind: {
        archive: {
          fullName: 'Test Archive',
          id: 1,
          role: 'access.role.editor',
        },
      },
    });
    const roleName = instance.roles['access.role.contributor'];

    expect(roleName).toBe('Contributor');
  });
});
