import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { OnboardingModule } from '../../onboarding.module';
import { OnboardingService } from '../../services/onboarding.service';
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
	let onboardingService: OnboardingService;

	beforeEach(async () => {
		onboardingService = new OnboardingService();
		shallow = new Shallow(GlamPendingArchivesComponent, OnboardingModule)
			.mock(AccountService, mockAccountService)
			.mock(ApiService, {
				archive: {
					accept: (archive: ArchiveVO) => Promise.resolve(),
				},
			})
			.provide({ provide: OnboardingService, useValue: onboardingService })
			.dontMock(OnboardingService);
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

	it('should call api.archive.accept when selectArchive is called', async () => {
		const { instance, inject } = await shallow.render();
		const apiService = inject(ApiService);
		spyOn(apiService.archive, 'accept').and.callThrough();

		const archive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		await instance.selectArchive(archive);

		expect(apiService.archive.accept).toHaveBeenCalledWith(archive);
	});

	it('should add archive to acceptedArchives when selectArchive is called', async () => {
		const { instance } = await shallow.render();
		const archive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		await instance.selectArchive(archive);

		expect(instance.acceptedArchives.length).toBe(1);
		expect(instance.acceptedArchives[0].archiveId).toBe(1);
	});

	it('should set selectedArchive if no archive was previously selected', async () => {
		const { instance } = await shallow.render();
		const archive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		expect(instance.selectedArchive).toBeNull();
		await instance.selectArchive(archive);

		expect(instance.selectedArchive.archiveId).toBe(archive.archiveId);
	});

	it('should return true when isSelected is called for an accepted archive', async () => {
		const { instance } = await shallow.render();
		const archive: ArchiveVO = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test Archive',
		});

		await instance.selectArchive(archive);

		expect(instance.isSelected(1)).toBeTrue();
	});

	it('should return false when isSelected is called for a non-accepted archive', async () => {
		const { instance } = await shallow.render();

		expect(instance.isSelected(1)).toBeFalse();
	});

	it('should register accepted archives with the onboardingservice', async () => {
		const { instance, inject } = await shallow.render();
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
		const onboardingService = inject(OnboardingService);

		expect(onboardingService.getFinalArchives().length).toBe(3);
	});

	it('fetches previously accepted archives from onboarding service', async () => {
		const archive = new ArchiveVO({ archiveId: 1, fullName: 'Archive 1' });
		onboardingService.registerArchive(archive);

		const { instance } = await shallow.render({
			bind: {
				pendingArchives: [archive],
			},
		});

		expect(instance.acceptedArchives.length).toBe(1);
		expect(instance.acceptedArchives[0].archiveId).toBe(archive.archiveId);
		expect(instance.selectedArchive).not.toBeNull();
	});
});
