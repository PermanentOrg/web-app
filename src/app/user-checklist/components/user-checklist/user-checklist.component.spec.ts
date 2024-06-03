/* @format */
import { Shallow } from 'shallow-render';
import { CHECKLIST_API, ChecklistApi } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';
import { UserChecklistModule } from '../../user-checklist.module';
import { UserChecklistComponent } from './user-checklist.component';

class DummyChecklistApi implements ChecklistApi {
  public static items: ChecklistItem[] = [];

  public static reset(): void {
    this.items = [];
  }

  public async getChecklistItems(): Promise<ChecklistItem[]> {
    return DummyChecklistApi.items;
  }
}

fdescribe('UserChecklistComponent', () => {
  let shallow: Shallow<UserChecklistComponent>;

  function createTestTask(data?: Partial<ChecklistItem>): ChecklistItem {
    return Object.assign(
      {
        id: 'test_task',
        title: 'Write a unit test',
        completed: true,
      },
      data ?? {}
    );
  }

  beforeEach(async () => {
    shallow = new Shallow(
      UserChecklistComponent,
      UserChecklistModule
    ).provideMock({
      provide: CHECKLIST_API,
      useClass: DummyChecklistApi,
    });
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should list all tasks received from the API', async () => {
    DummyChecklistApi.items = [
      createTestTask({ title: 'Write a unit test' }),
      createTestTask({ title: 'Write production code' }),
    ];
    const { element } = await shallow.render();

    expect(element.nativeElement.innerText).toContain('Write a unit test');
    expect(element.nativeElement.innerText).toContain('Write production code');
  });

  it('should mark completed status on completed tasks', async () => {
    DummyChecklistApi.items = [createTestTask({ completed: true })];
    const { find } = await shallow.render();

    expect(find('.task-name.completed').length).toBe(1);
    expect(
      find('.task input[type="checkbox"]').nativeElement.checked
    ).toBeTrue();
  });

  it('should not mark completed status on incomplete tasks', async () => {
    DummyChecklistApi.items = [createTestTask({ completed: false })];
    const { find } = await shallow.render();

    expect(find('.task-name.completed').length).toBe(0);
    expect(
      find('.task input[type="checkbox"]').nativeElement.checked
    ).toBeFalse();
  });

  describe('Percentage completion', () => {
    async function expectPercentage(
      completed: number,
      incomplete: number,
      percentage: number
    ) {
      DummyChecklistApi.items = [];
      for (let i = 0; i < completed; i++) {
        DummyChecklistApi.items.push(createTestTask({ completed: true }));
      }
      for (let i = 0; i < incomplete; i++) {
        DummyChecklistApi.items.push(createTestTask({ completed: false }));
      }
      const { find } = await shallow.render();
      const meterValue = find('meter').nativeElement.value;

      expect(Math.round(meterValue)).toBe(percentage);
      expect(find('.percent-value').nativeElement.innerText).toContain(
        `${percentage}%`
      );
    }

    it('should list 0% in a divide-by-zero case', async () => {
      await expectPercentage(0, 0, 0);
    });

    it('should list 0% for no tasks done', async () => {
      await expectPercentage(0, 1, 0);
    });

    it('should list 100% for all tasks done', async () => {
      await expectPercentage(1, 0, 100);
    });

    it('should round down to whole numbers', async () => {
      await expectPercentage(1, 6, 14);
    });

    it('should round up to whole numbers if nearest', async () => {
      await expectPercentage(6, 1, 86);
    });
  });
});
