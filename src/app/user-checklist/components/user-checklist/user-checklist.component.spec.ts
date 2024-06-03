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
      {
        id: 'test_task',
        title: 'Write a unit test',
        completed: true,
      },
      {
        id: 'test_task2',
        title: 'Write production code',
        completed: false,
      },
    ];
    const { element } = await shallow.render();

    expect(element.nativeElement.innerText).toContain('Write a unit test');
    expect(element.nativeElement.innerText).toContain('Write production code');
  });
});
