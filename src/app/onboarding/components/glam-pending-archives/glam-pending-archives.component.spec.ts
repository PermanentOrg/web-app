import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { OnboardingService } from '../../services/onboarding.service';
import { GlamPendingArchivesComponent } from './glam-pending-archives.component';

const mockAccountService = {
	getAccount: () => ({
		fullName: 'John Doe',
	}),
};

describe('GlamPendingArchivesComponent', () => {
	let fixture: ComponentFixture<GlamPendingArchivesComponent>;
	let instance: GlamPendingArchivesComponent;
	let onboardingService: OnboardingService;
	let apiService: ApiService;

	beforeEach(async () => {
		onboardingService = new OnboardingService();

		await TestBed.configureTestingModule({
			declarations: [GlamPendingArchivesComponent],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				{
					provide: ApiService,
					useValue: {
						archive: {
							accept: async (archive: ArchiveVO) => await Promise.resolve(),
						},
					},
				},
				{ provide: OnboardingService, useValue: onboardingService },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		apiService = TestBed.inject(ApiService);
	});

	it('should create the component', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		expect(instance).toBeTruthy();
	});

	it('should initialize accountName from AccountService', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		expect(instance.accountName).toBe('John Doe');
	});

	it('should render the list of pending archives', async () => {
		const pendingArchives: ArchiveVO[] = [
			new ArchiveVO({ archiveId: 1, fullName: 'Archive 1' }),
			new ArchiveVO({ archiveId: 2, fullName: 'Archive 2' }),
		];

		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		instance.pendingArchives = pendingArchives;
		fixture.detectChanges();

		const archiveElements =
			fixture.nativeElement.querySelectorAll('pr-pending-archive');

		expect(archiveElements.length).toBe(2);
	});

	it('should emit createNewArchiveOutput when createNewArchive is called', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		spyOn(instance.createNewArchiveOutput, 'emit');
		instance.createNewArchive();

		expect(instance.createNewArchiveOutput.emit).toHaveBeenCalled();
	});

	it('should emit nextOutput with selected archive when next is called', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		spyOn(instance.nextOutput, 'emit');
		const selectedArchive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		instance.selectedArchive = selectedArchive;
		instance.next();

		expect(instance.nextOutput.emit).toHaveBeenCalledWith(selectedArchive);
	});

	it('should call api.archive.accept when selectArchive is called', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		spyOn(apiService.archive, 'accept').and.callThrough();

		const archive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		await instance.selectArchive(archive);

		expect(apiService.archive.accept).toHaveBeenCalledWith(archive);
	});

	it('should add archive to acceptedArchives when selectArchive is called', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		const archive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		await instance.selectArchive(archive);

		expect(instance.acceptedArchives.length).toBe(1);
		expect(instance.acceptedArchives[0].archiveId).toBe(1);
	});

	it('should set selectedArchive if no archive was previously selected', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		const archive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		expect(instance.selectedArchive).toBeNull();
		await instance.selectArchive(archive);

		expect(instance.selectedArchive.archiveId).toBe(archive.archiveId);
	});

	it('should return true when isSelected is called for an accepted archive', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		const archive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		await instance.selectArchive(archive);

		expect(instance.isSelected(1)).toBeTrue();
	});

	it('should return false when isSelected is called for a non-accepted archive', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		expect(instance.isSelected(1)).toBeFalse();
	});

	it('should register accepted archives with the onboardingservice', async () => {
		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();

		const archives: ArchiveVO[] = [
			new ArchiveVO({
				archiveId: 1,
				fullName: 'Test Archive',
			}),
			new ArchiveVO({
				archiveId: 2,
				fullName: 'Test Archive',
			}),
			new ArchiveVO({
				archiveId: 3,
				fullName: 'Test Archive',
			}),
		];
		for (const archive of archives) {
			await instance.selectArchive(archive);
		}
		instance.next();

		expect(onboardingService.getFinalArchives().length).toBe(3);
	});

	it('fetches previously accepted archives from onboarding service', async () => {
		const archive = new ArchiveVO({ archiveId: 1, fullName: 'Archive 1' });
		onboardingService.registerArchive(archive);

		fixture = TestBed.createComponent(GlamPendingArchivesComponent);
		instance = fixture.componentInstance;
		instance.pendingArchives = [archive];
		fixture.detectChanges();

		expect(instance.acceptedArchives.length).toBe(1);
		expect(instance.acceptedArchives[0].archiveId).toBe(archive.archiveId);
		expect(instance.selectedArchive).not.toBeNull();
	});
});
