/* @format */
import { Shallow } from 'shallow-render';
import { CHECKLIST_API, ChecklistApi } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';
import { UserChecklistModule } from '../../user-checklist.module';
import { UserChecklistComponent } from './user-checklist.component';

class DummyChecklistApi implements ChecklistApi {
  public static error: boolean = false;
  public static items: ChecklistItem[] = [];

  public static reset(): void {
    this.items = [];
    this.error = false;
  }

  public async getChecklistItems(): Promise<ChecklistItem[]> {
    if (DummyChecklistApi.error) {
      throw new Error('Unit test forced error');
    }
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
      data ?? {},
    );
  }

  function expectComponentToBeInvisible(find) {
    expect(find('.user-checklist').length).toBe(0);
    expect(find('.user-checklist-minimized').length).toBe(0);
  }

  beforeEach(async () => {
    DummyChecklistApi.reset();
    DummyChecklistApi.items = [createTestTask()];
    shallow = new Shallow(
      UserChecklistComponent,
      UserChecklistModule,
    ).provideMock({
      provide: CHECKLIST_API,
      useClass: DummyChecklistApi,
    });
  });

  it('should create', async () => {
    const { find, instance } = await shallow.render();

    expect(instance).toBeTruthy();
    expect(find('.user-checklist').length).toBeGreaterThan(0);
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
      find('.task input[type="checkbox"]').nativeElement.checked,
    ).toBeTrue();
  });

  it('should not mark completed status on incomplete tasks', async () => {
    DummyChecklistApi.items = [createTestTask({ completed: false })];
    const { find } = await shallow.render();

    expect(find('.task-name.completed').length).toBe(0);
    expect(
      find('.task input[type="checkbox"]').nativeElement.checked,
    ).toBeFalse();
  });

  it('should be able to handle an API error', async () => {
    DummyChecklistApi.error = true;

    const { fixture, find } = await shallow.render();
    await fixture.whenStable();

    expectComponentToBeInvisible(find);
  });

  it('can be minimized', async () => {
    const { find, fixture } = await shallow.render();

    find('.minimize-button').triggerEventHandler('click');
    fixture.detectChanges();

    expect(find('.user-checklist').length).toBe(0);
  });

  it('can be opened again after being minimized', async () => {
    const { find, fixture } = await shallow.render();

    find('.minimize-button').triggerEventHandler('click');
    fixture.detectChanges();
    find('.open-button').triggerEventHandler('click');
    fixture.detectChanges();

    expect(find('.user-checklist').length).toBeGreaterThan(0);
  });

  it('is hidden completely if no tasks come back from the API', async () => {
    DummyChecklistApi.items = [];

    const { find } = await shallow.render();

    expectComponentToBeInvisible(find);
  });

  describe('Percentage completion', () => {
    async function expectPercentage(
      completed: number,
      incomplete: number,
      percentage: number,
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
        `${percentage}%`,
      );
    }

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
