import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { CHECKLIST_API } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';
import { UserChecklistModule } from '../../user-checklist.module';
import { UserChecklistComponent } from './user-checklist.component';
import { DummyChecklistApi } from './shared-mocks';

describe('UserChecklistComponent', () => {
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

	function expectComponentToBeInvisible() {
		expect(ngMocks.findAll('.user-checklist').length).toBe(0);
		expect(ngMocks.findAll('.user-checklist-minimized').length).toBe(0);
	}

	beforeEach(async () => {
		DummyChecklistApi.reset();
		DummyChecklistApi.items = [createTestTask()];
		await MockBuilder(UserChecklistComponent, UserChecklistModule).provide({
			provide: CHECKLIST_API,
			useClass: DummyChecklistApi,
		});
	});

	it('should create', () => {
		const fixture = MockRender(UserChecklistComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
		expect(ngMocks.findAll('.user-checklist').length).toBeGreaterThan(0);
	});

	it('should list all tasks received from the API', fakeAsync(() => {
		DummyChecklistApi.items = [
			createTestTask({ title: 'Write a unit test' }),
			createTestTask({ title: 'Write production code' }),
		];
		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		expect(fixture.point.nativeElement.innerText).toContain(
			'Write a unit test',
		);

		expect(fixture.point.nativeElement.innerText).toContain(
			'Write production code',
		);
	}));

	it('should mark completed status on completed tasks', fakeAsync(() => {
		DummyChecklistApi.items = [createTestTask({ completed: true })];
		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.task-name.completed').length).toBe(1);
		expect(
			ngMocks.findAll('.task .fake-checkbox.checked').length,
		).toBeGreaterThan(0);
	}));

	it('should not mark completed status on incomplete tasks', fakeAsync(() => {
		DummyChecklistApi.items = [createTestTask({ completed: false })];
		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.task-name.completed').length).toBe(0);
		expect(ngMocks.findAll('.task .fake-checkbox.checked').length).toBe(0);
	}));

	it('should be able to handle an API error', fakeAsync(() => {
		DummyChecklistApi.error = true;

		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		expectComponentToBeInvisible();
	}));

	it('can be minimized', fakeAsync(() => {
		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		ngMocks.find('.minimize-button').triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.user-checklist').length).toBe(0);
	}));

	it('can be opened again after being minimized', fakeAsync(() => {
		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		ngMocks.find('.minimize-button').triggerEventHandler('click', {});
		fixture.detectChanges();
		ngMocks.find('.open-button').triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.user-checklist').length).toBeGreaterThan(0);
	}));

	it('is hidden completely if no tasks come back from the API', fakeAsync(() => {
		DummyChecklistApi.items = [];

		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		expectComponentToBeInvisible();
	}));

	it('is hidden if the account has the hideChecklist setting enabled', () => {
		DummyChecklistApi.accountHidden = true;

		MockRender(UserChecklistComponent);

		expectComponentToBeInvisible();
	});

	it('is hidden if the account does not own the archive', () => {
		DummyChecklistApi.archiveAccess = 'access.role.viewer';

		MockRender(UserChecklistComponent);

		expectComponentToBeInvisible();
	});

	it('should hide itself and save account property when clicking the dismiss button', fakeAsync(() => {
		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		ngMocks.find('.dont-show-again').triggerEventHandler('click', {});
		flush();
		fixture.detectChanges();

		expectComponentToBeInvisible();

		expect(DummyChecklistApi.savedAccount).toBeTrue();
	}));

	it('should fail silently if the account save fails', async () => {
		const fixture = MockRender(UserChecklistComponent);
		const instance = fixture.point.componentInstance;

		DummyChecklistApi.error = true;

		const api = TestBed.inject(CHECKLIST_API);
		await expectAsync(api.setChecklistHidden()).toBeRejected();
		await expectAsync(instance.hideChecklistForever()).not.toBeRejected();
	});

	it('should be able to watch for archive info changes and hide when archive is not owned', fakeAsync(() => {
		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		DummyChecklistApi.archiveAccess = 'access.role.viewer';

		expect(ngMocks.findAll('.user-checklist').length).toBe(1);

		const api = TestBed.inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendArchiveChangeEvent();
		fixture.detectChanges();

		expectComponentToBeInvisible();
	}));

	it('should be able to watch for archive info changes and show when archive is owned', fakeAsync(() => {
		DummyChecklistApi.archiveAccess = 'access.role.viewer';
		const fixture = MockRender(UserChecklistComponent);
		flush();
		fixture.detectChanges();

		DummyChecklistApi.archiveAccess = 'access.role.owner';

		expectComponentToBeInvisible();

		const api = TestBed.inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendArchiveChangeEvent();
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.user-checklist').length).toBe(1);
	}));

	it('unsubscribes from archive change subscriptions on destroy', fakeAsync(() => {
		const fixture = MockRender(UserChecklistComponent);
		const instance = fixture.point.componentInstance;
		flush();

		instance.ngOnDestroy();

		DummyChecklistApi.archiveAccess = 'access.role.viewer';
		const api = TestBed.inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendArchiveChangeEvent();

		expect(instance.isDisplayed).toBeTruthy();
	}));

	it('should refresh the checklist when a refresh event fires', fakeAsync(() => {
		const fixture = MockRender(UserChecklistComponent);
		const instance = fixture.point.componentInstance;
		flush();

		DummyChecklistApi.items = [
			createTestTask({ id: 'refresh', title: 'Refresh the checklist' }),
		];
		const api = TestBed.inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendRefreshEvent();
		flush();

		expect(instance.items[0].id).toBe('refresh');
	}));

	it('unsubscribes from refresh subscriptions on destroy', fakeAsync(() => {
		const fixture = MockRender(UserChecklistComponent);
		const instance = fixture.point.componentInstance;
		flush();

		instance.ngOnDestroy();

		DummyChecklistApi.items = [
			createTestTask({ id: 'refresh', title: 'Refresh the checklist' }),
		];
		const api = TestBed.inject(CHECKLIST_API) as DummyChecklistApi;
		api.sendRefreshEvent();
		flush();

		expect(instance.items[0].id).not.toBe('refresh');
	}));

	it('should not throw errors if subscriptions are undefined', () => {
		DummyChecklistApi.accountHidden = true;

		const fixture = MockRender(UserChecklistComponent);
		const instance = fixture.point.componentInstance;

		expect(() => instance.ngOnDestroy()).not.toThrow();
	});

	describe('Percentage completion', () => {
		function expectPercentage(
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
			const fixture = MockRender(UserChecklistComponent);
			flush();
			fixture.detectChanges();

			const meterValue = parseFloat(
				ngMocks.find('.meter-value').nativeElement.style.width,
			);

			expect(Math.round(meterValue)).toBe(percentage);
			expect(ngMocks.find('.percent-value').nativeElement.innerText).toContain(
				`${percentage}%`,
			);
		}

		it('should list 0% for no tasks done', fakeAsync(() => {
			expectPercentage(0, 1, 0);
		}));

		it('should list 100% for all tasks done', fakeAsync(() => {
			expectPercentage(1, 0, 100);
		}));

		it('should round down to whole numbers', fakeAsync(() => {
			expectPercentage(1, 6, 14);
		}));

		it('should round up to whole numbers if nearest', fakeAsync(() => {
			expectPercentage(6, 1, 86);
		}));
	});
});
