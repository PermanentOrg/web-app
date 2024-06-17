/* @format */
import { Shallow } from 'shallow-render';
import { UserChecklistModule } from '../../user-checklist.module';
import { TaskIconComponent } from './task-icon.component';

describe('TaskIconComponent', () => {
  let shallow: Shallow<TaskIconComponent>;

  beforeEach(async () => {
    shallow = new Shallow(TaskIconComponent, UserChecklistModule);
  });

  it('does nothing with no icon input', async () => {
    const { find } = await shallow.render();

    expect(find('.completed').length).toBe(0);
    expect(find('svg').length).toBe(0);
  });

  it('can handle undefined icons', async () => {
    const { find } = await shallow.render({
      bind: { icon: 'undefinedIconForUnitTest' },
    });

    expect(find('svg').length).toBe(0);
  });

  it('should mark the element as completed if specified in the input', async () => {
    const { find } = await shallow.render({
      bind: { completed: true },
    });

    expect(find('.completed').length).toBe(1);
  });

  describe('defined icons', () => {
    async function expectIconToHaveDefinedSvg(icon: string) {
      const { find } = await shallow.render({
        bind: {
          icon,
        },
      });

      expect(find('svg').length).toBe(1);
    }
    const icons = [
      'archiveCreated',
      'storageRedeemed',
      'legacyContact',
      'archiveSteward',
      'archiveProfile',
      'firstUpload',
      'publishContent',
    ];
    icons.forEach((icon) => {
      it(`has an icon for the "${icon}" item`, async () => {
        await expectIconToHaveDefinedSvg(icon);
      });
    });
  });
});
