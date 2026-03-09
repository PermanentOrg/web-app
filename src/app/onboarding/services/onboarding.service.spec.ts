import { TestBed } from '@angular/core/testing';
import { ArchiveVO } from '@models/index';
import { OnboardingTypes } from '../shared/onboarding-screen';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
	let service: OnboardingService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(OnboardingService);
	});

	afterEach(() => {
		sessionStorage.clear();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('can register a created archive and fetch it', () => {
		service.registerArchive(
			new ArchiveVO({ fullName: 'Unit Test', accessRole: 'access.role.owner' }),
		);
		const archives = service.getFinalArchives();

		expect(archives.length).toBe(1);
		expect(archives[0].fullName).toBe('Unit Test');
		expect(archives[0].accessRole).toBe('access.role.owner');
	});

	describe('archiveName', () => {
		it('should return null when archive name is not set', () => {
			expect(service.getArchiveName()).toBeNull();
		});

		it('should store and retrieve archive name', () => {
			service.setArchiveName('Test Archive');

			expect(service.getArchiveName()).toBe('Test Archive');
		});
	});

	describe('archiveType', () => {
		it('should return null when archive type is not set', () => {
			expect(service.getArchiveType()).toBeNull();
		});

		it('should store and retrieve archive type', () => {
			service.setArchiveType('type.archive.person');

			expect(service.getArchiveType()).toBe('type.archive.person');
		});
	});

	describe('archiveTypeTag', () => {
		it('should return null when archive type tag is not set', () => {
			expect(service.getArchiveTypeTag()).toBeNull();
		});

		it('should store and retrieve archive type tag', () => {
			service.setArchiveTypeTag(OnboardingTypes.myself);

			expect(service.getArchiveTypeTag()).toBe(OnboardingTypes.myself);
		});
	});

	describe('goals', () => {
		it('should return empty array when goals are not set', () => {
			expect(service.getGoals()).toEqual([]);
		});

		it('should store and retrieve goals', () => {
			service.setGoals(['goal:capture', 'goal:share']);

			expect(service.getGoals()).toEqual(['goal:capture', 'goal:share']);
		});
	});

	describe('reasons', () => {
		it('should return empty array when reasons are not set', () => {
			expect(service.getReasons()).toEqual([]);
		});

		it('should store and retrieve reasons', () => {
			service.setReasons(['why:safe', 'why:nonprofit']);

			expect(service.getReasons()).toEqual(['why:safe', 'why:nonprofit']);
		});
	});

	describe('onboardingScreen', () => {
		it('should return null when onboarding screen is not set', () => {
			expect(service.getOnboardingScreen()).toBeNull();
		});

		it('should store and retrieve onboarding screen', () => {
			service.setOnboardingScreen('goals');

			expect(service.getOnboardingScreen()).toBe('goals');
		});

		it('should remove onboarding screen', () => {
			service.setOnboardingScreen('reasons');
			service.removeOnboardingScreen();

			expect(service.getOnboardingScreen()).toBeNull();
		});
	});

	describe('clearSessionStorage', () => {
		it('should clear all onboarding sessionStorage keys', () => {
			const keys = [
				'archiveName',
				'archiveType',
				'archiveTypeTag',
				'goals',
				'reasons',
				'onboardingScreen',
			];
			keys.forEach((key) => sessionStorage.setItem(key, 'test-value'));

			service.clearSessionStorage();

			keys.forEach((key) => {
				expect(sessionStorage.getItem(key)).toBeNull();
			});
		});

		it('should not clear unrelated sessionStorage keys', () => {
			sessionStorage.setItem('unrelatedKey', 'should-persist');

			service.clearSessionStorage();

			expect(sessionStorage.getItem('unrelatedKey')).toBe('should-persist');
		});

		it('should not clear registered archives', () => {
			service.registerArchive(new ArchiveVO({ fullName: 'Test' }));

			service.clearSessionStorage();

			expect(service.getFinalArchives().length).toBe(1);
		});
	});

	describe('resetSessionState', () => {
		it('should clear sessionStorage and registered archives', () => {
			sessionStorage.setItem('archiveName', 'test');
			service.registerArchive(new ArchiveVO({ fullName: 'Test' }));

			service.resetSessionState();

			expect(sessionStorage.getItem('archiveName')).toBeNull();
			expect(service.getFinalArchives().length).toBe(0);
		});
	});
});
