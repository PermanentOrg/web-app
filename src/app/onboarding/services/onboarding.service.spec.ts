import { TestBed } from '@angular/core/testing';
import { ArchiveVO } from '@models/index';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
	let service: OnboardingService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(OnboardingService);
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

	describe('clearOnboardingStorage', () => {
		afterEach(() => {
			sessionStorage.clear();
		});

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

			service.clearOnboardingStorage();

			keys.forEach((key) => {
				expect(sessionStorage.getItem(key)).toBeNull();
			});
		});

		it('should not clear unrelated sessionStorage keys', () => {
			sessionStorage.setItem('unrelatedKey', 'should-persist');

			service.clearOnboardingStorage();

			expect(sessionStorage.getItem('unrelatedKey')).toBe('should-persist');
		});

		it('should not clear registered archives', () => {
			service.registerArchive(new ArchiveVO({ fullName: 'Test' }));

			service.clearOnboardingStorage();

			expect(service.getFinalArchives().length).toBe(1);
		});
	});

	describe('resetOnboardingState', () => {
		afterEach(() => {
			sessionStorage.clear();
		});

		it('should clear sessionStorage and registered archives', () => {
			sessionStorage.setItem('archiveName', 'test');
			service.registerArchive(new ArchiveVO({ fullName: 'Test' }));

			service.resetOnboardingState();

			expect(sessionStorage.getItem('archiveName')).toBeNull();
			expect(service.getFinalArchives().length).toBe(0);
		});
	});
});
