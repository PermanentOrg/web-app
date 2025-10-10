import { Shallow } from 'shallow-render';
import { CHECKLIST_API } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';
import { UserChecklistModule } from '../../user-checklist.module';
import { UserChecklistComponent } from './user-checklist.component';
import { DummyChecklistApi } from './shared-mocks';

describe('UserChecklistComponent', () => {
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
		expect(find('.task .fake-checkbox.checked').length).toBeGreaterThan(0);
	});

	it('should not mark completed status on incomplete tasks', async () => {
		DummyChecklistApi.items = [createTestTask({ completed: false })];
		const { find } = await shallow.render();

		expect(find('.task-name.completed').length).toBe(0);
		expect(find('.task .fake-checkbox.checked').length).toBe(0);
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

	it('is hidden if the account has the hideChecklist setting enabled', async () => {
		DummyChecklistApi.accountHidden = true;

		const { find } = await shallow.render();

		expectComponentToBeInvisible(find);
	});

	it('is hidden if the account does not own the archive', async () => {
		DummyChecklistApi.archiveAccess = 'access.role.viewer';

		const { find } = await shallow.render();

		expectComponentToBeInvisible(find);
	});

	it('should hide itself and save account property when clicking the dismiss button', async () => {
		const { find, fixture } = await shallow.render();

		find('.dont-show-again').triggerEventHandler('click');
		await fixture.whenStable();
		fixture.detectChanges();

		expectComponentToBeInvisible(find);

		expect(DummyChecklistApi.savedAccount).toBeTrue();
	});

	it('should fail silently if the account save fails', async () => {
		const { instance, inject } = await shallow.render();

		DummyChecklistApi.error = true;

		await expectAsync(
			inject(CHECKLIST_API).setChecklistHidden(),
		).toBeRejected();
		await expectAsync(instance.hideChecklistForever()).not.toBeRejected();
	});

	it('should be able to watch for archive info changes and hide when archive is not owned', async () => {
		const { find, fixture, inject } = await shallow.render();

		await fixture.whenStable();
		DummyChecklistApi.archiveAccess = 'access.role.viewer';

		expect(find('.user-checklist').length).toBe(1);

		const api = inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendArchiveChangeEvent();
		fixture.detectChanges();

		expectComponentToBeInvisible(find);
	});

	it('should be able to watch for archive info changes and show when archive is owned', async () => {
		DummyChecklistApi.archiveAccess = 'access.role.viewer';
		const { find, fixture, inject } = await shallow.render();

		await fixture.whenStable();

		DummyChecklistApi.archiveAccess = 'access.role.owner';

		expectComponentToBeInvisible(find);

		const api = inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendArchiveChangeEvent();
		fixture.detectChanges();

		expect(find('.user-checklist').length).toBe(1);
	});

	it('unsubscribes from archive change subscriptions on destroy', async () => {
		const { instance, inject } = await shallow.render();

		instance.ngOnDestroy();

		DummyChecklistApi.archiveAccess = 'access.role.viewer';
		const api = inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendArchiveChangeEvent();

		expect(instance.isDisplayed).toBeTruthy();
	});

	it('should refresh the checklist when a refresh event fires', async () => {
		const { fixture, instance, inject } = await shallow.render();

		DummyChecklistApi.items = [
			createTestTask({ id: 'refresh', title: 'Refresh the checklist' }),
		];
		const api = inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendRefreshEvent();
		await fixture.whenStable();

		expect(instance.items[0].id).toBe('refresh');
	});

	it('unsubscribes from refresh subscriptions on destroy', async () => {
		const { fixture, instance, inject } = await shallow.render();

		instance.ngOnDestroy();

		DummyChecklistApi.items = [
			createTestTask({ id: 'refresh', title: 'Refresh the checklist' }),
		];
		const api = inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendRefreshEvent();
		await fixture.whenStable();

		expect(instance.items[0].id).not.toBe('refresh');
	});

	it('should not throw errors if subscriptions are undefined', async () => {
		DummyChecklistApi.accountHidden = true;

		const { instance } = await shallow.render();

		expect(() => instance.ngOnDestroy()).not.toThrow();
	});

	describe('Percentage completion', () => {
		async function expectPercentage(
			completed: number,
			incomplete: number,
			percentage: number,
		) {
			DummyChecklistApi.items = [];
			for (let i = 0; i < completed; i += 1) {
				DummyChecklistApi.items.push(createTestTask({ completed: true }));
			}
			for (let i = 0; i < incomplete; i += 1) {
				DummyChecklistApi.items.push(createTestTask({ completed: false }));
			}
			const { find } = await shallow.render();
			const meterValue = parseFloat(
				find('.meter-value').nativeElement.style.width,
			);

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
