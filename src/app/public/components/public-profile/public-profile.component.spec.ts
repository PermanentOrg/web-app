import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicProfileComponent } from './public-profile.component';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { ArchiveVO } from '@models';
import {
	ProfileItemVODictionary,
	ProfileItemVOData,
} from '@models/profile-item-vo';
import { BehaviorSubject } from 'rxjs';

describe('PublicProfileComponent', () => {
	let component: PublicProfileComponent;
	let fixture: ComponentFixture<PublicProfileComponent>;
	let mockPublicProfileService: jasmine.SpyObj<PublicProfileService>;
	let archiveSubject: BehaviorSubject<ArchiveVO>;
	let profileItemsSubject: BehaviorSubject<ProfileItemVODictionary>;

	const mockArchive = { archiveId: '1', fullName: 'Test Archive' } as ArchiveVO;

	const createMockProfileItem = (
		string1: string,
		day1: string,
	): ProfileItemVOData => ({
		string1,
		day1,
		string2: '',
		day2: '',
		LocnVOs: [],
	} as ProfileItemVOData);

	const mockProfileItems: ProfileItemVODictionary = {
		milestone: [
			createMockProfileItem('Milestone 1', '2020-01-01'),
			createMockProfileItem('Milestone 2', '2022-01-01'),
			createMockProfileItem('Milestone 3', '2021-01-01'),
		],
		job: [
			createMockProfileItem('Job 1', '2019-01-01'),
			createMockProfileItem('Job 2', '2023-01-01'),
		],
		home: [createMockProfileItem('Home 1', '2018-01-01')],
	};

	beforeEach(async () => {
		archiveSubject = new BehaviorSubject<ArchiveVO>(mockArchive);
		profileItemsSubject = new BehaviorSubject<ProfileItemVODictionary>(
			mockProfileItems,
		);

		mockPublicProfileService = jasmine.createSpyObj('PublicProfileService', [
			'archive$',
			'profileItemsDictionary$',
		]);
		mockPublicProfileService.archive$.and.returnValue(archiveSubject);
		mockPublicProfileService.profileItemsDictionary$.and.returnValue(
			profileItemsSubject,
		);

		await TestBed.configureTestingModule({
			declarations: [PublicProfileComponent],
			providers: [
				{ provide: PublicProfileService, useValue: mockPublicProfileService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(PublicProfileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('initialization', () => {
		it('should subscribe to archive$ and set archive', () => {
			expect(component.archive).toEqual(mockArchive);
		});

		it('should subscribe to profileItemsDictionary$ and set profileItems', () => {
			expect(component.profileItems).toEqual(mockProfileItems);
		});

		it('should initialize milestoneSortOrder$ with "desc"', (done) => {
			component.milestoneSortOrder$.subscribe((order) => {
				expect(order).toBe('desc');
				done();
			});
		});
	});

	describe('milestones$ observable', () => {
		it('should combine milestone, job, and home profile items', (done) => {
			component.milestones$.subscribe((milestones) => {
				expect(milestones.length).toBe(6);
				done();
			});
		});

		it('should sort milestones in descending order by default', (done) => {
			component.milestones$.subscribe((milestones) => {
				expect(milestones[0].string1).toBe('Job 2');
				expect(milestones[0].day1).toBe('2023-01-01');
				expect(milestones[1].string1).toBe('Milestone 2');
				expect(milestones[1].day1).toBe('2022-01-01');
				expect(milestones[2].string1).toBe('Milestone 3');
				expect(milestones[2].day1).toBe('2021-01-01');
				expect(milestones[3].string1).toBe('Milestone 1');
				expect(milestones[3].day1).toBe('2020-01-01');
				expect(milestones[4].string1).toBe('Job 1');
				expect(milestones[4].day1).toBe('2019-01-01');
				expect(milestones[5].string1).toBe('Home 1');
				expect(milestones[5].day1).toBe('2018-01-01');
				done();
			});
		});

		it('should sort milestones in ascending order when sort order changes to asc', (done) => {
			component.milestoneSortOrder$.next('asc');

			component.milestones$.subscribe((milestones) => {
				expect(milestones[0].string1).toBe('Home 1');
				expect(milestones[0].day1).toBe('2018-01-01');
				expect(milestones[1].string1).toBe('Job 1');
				expect(milestones[1].day1).toBe('2019-01-01');
				expect(milestones[2].string1).toBe('Milestone 1');
				expect(milestones[2].day1).toBe('2020-01-01');
				expect(milestones[3].string1).toBe('Milestone 3');
				expect(milestones[3].day1).toBe('2021-01-01');
				expect(milestones[4].string1).toBe('Milestone 2');
				expect(milestones[4].day1).toBe('2022-01-01');
				expect(milestones[5].string1).toBe('Job 2');
				expect(milestones[5].day1).toBe('2023-01-01');
				done();
			});
		});

		it('should handle empty profile items', (done) => {
			profileItemsSubject.next({});

			component.milestones$.subscribe((milestones) => {
				expect(milestones.length).toBe(0);
				done();
			});
		});

		it('should handle missing milestone, job, or home arrays', (done) => {
			profileItemsSubject.next({
				milestone: [createMockProfileItem('Milestone Only', '2022-01-01')],
			});

			component.milestones$.subscribe((milestones) => {
				expect(milestones.length).toBe(1);
				expect(milestones[0].string1).toBe('Milestone Only');
				done();
			});
		});
	});

	describe('toggleMilestoneSortOrder', () => {
		it('should toggle from desc to asc', (done) => {
			component.toggleMilestoneSortOrder();

			component.milestoneSortOrder$.subscribe((order) => {
				expect(order).toBe('asc');
				done();
			});
		});

		it('should toggle from asc to desc', (done) => {
			component.milestoneSortOrder$.next('asc');

			component.toggleMilestoneSortOrder();

			component.milestoneSortOrder$.subscribe((order) => {
				expect(order).toBe('desc');
				done();
			});
		});

		it('should cause milestones$ to re-emit with new sort order', (done) => {
			let emissionCount = 0;
			const emissions: ProfileItemVOData[][] = [];

			component.milestones$.subscribe((milestones) => {
				emissions.push(milestones);
				emissionCount++;

				if (emissionCount === 1) {
					// First emission should be descending
					expect(milestones[0].day1).toBe('2023-01-01');
					expect(milestones[5].day1).toBe('2018-01-01');
					component.toggleMilestoneSortOrder();
				} else if (emissionCount === 2) {
					// Second emission should be ascending
					expect(milestones[0].day1).toBe('2018-01-01');
					expect(milestones[5].day1).toBe('2023-01-01');
					done();
				}
			});
		});
	});

	describe('template rendering', () => {
		it('should render header with sort-desc class when sort order is desc', () => {
			fixture.detectChanges();
			const headerElement: HTMLElement =
				fixture.nativeElement.querySelector('.profile-section-header');

			expect(headerElement.classList.contains('active-sort')).toBe(true);
			expect(headerElement.classList.contains('sort-desc')).toBe(true);
		});

		it('should render header without sort-desc class when sort order is asc', () => {
			component.milestoneSortOrder$.next('asc');
			fixture.detectChanges();

			const headerElement: HTMLElement =
				fixture.nativeElement.querySelector('.profile-section-header');

			expect(headerElement.classList.contains('active-sort')).toBe(true);
			expect(headerElement.classList.contains('sort-desc')).toBe(false);
		});

		it('should toggle sort order when header title is clicked', () => {
			fixture.detectChanges();

			const headerTitle: HTMLElement =
				fixture.nativeElement.querySelector('.header-title');
			const initialOrder = component.milestoneSortOrder$.value;

			headerTitle.click();
			fixture.detectChanges();

			expect(component.milestoneSortOrder$.value).toBe(
				initialOrder === 'desc' ? 'asc' : 'desc',
			);
		});

		it('should update header classes when sort order changes', () => {
			fixture.detectChanges();
			const headerElement: HTMLElement =
				fixture.nativeElement.querySelector('.profile-section-header');

			expect(headerElement.classList.contains('sort-desc')).toBe(true);

			component.milestoneSortOrder$.next('asc');
			fixture.detectChanges();

			expect(headerElement.classList.contains('sort-desc')).toBe(false);

			component.milestoneSortOrder$.next('desc');
			fixture.detectChanges();

			expect(headerElement.classList.contains('sort-desc')).toBe(true);
		});

		it('should have appropriate aria-label for accessibility', () => {
			fixture.detectChanges();
			const headerTitle: HTMLElement =
				fixture.nativeElement.querySelector('.header-title');

			expect(headerTitle.getAttribute('aria-label')).toContain(
				'Milestones sorted',
			);
			expect(headerTitle.getAttribute('aria-label')).toContain('click to sort');
		});
	});

	describe('component cleanup', () => {
		it('should unsubscribe from all subscriptions on destroy', () => {
			const subscription1 = jasmine.createSpyObj('Subscription', [
				'unsubscribe',
			]);
			const subscription2 = jasmine.createSpyObj('Subscription', [
				'unsubscribe',
			]);

			component.subscriptions = [subscription1, subscription2];

			component.ngOnDestroy();

			expect(subscription1.unsubscribe).toHaveBeenCalled();
			expect(subscription2.unsubscribe).toHaveBeenCalled();
		});
	});
});
