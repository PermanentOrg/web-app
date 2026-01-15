import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { ArchiveVO } from '@models/archive-vo';
import { WelcomeScreenComponent } from './welcome-screen.component';

@NgModule()
class DummyModule {}

describe('WelcomeScreenComponent #onboarding', () => {
	async function defaultRender(pendingArchives: ArchiveVO[] = []) {
		return MockRender(WelcomeScreenComponent, {
			pendingArchives,
		});
	}
	beforeEach(async () => {
		await MockBuilder(WelcomeScreenComponent, DummyModule);
	});

	it('should exist', async () => {
		await defaultRender();

		expect(ngMocks.find('.welcome-screen')).toBeTruthy();
	});

	it('should display a list of pending archives if they are available', async () => {
		const pendingArchives: ArchiveVO[] = [
			new ArchiveVO({
				fullName: 'Pending Test',
			}),
		];
		await defaultRender(pendingArchives);

		expect(ngMocks.findAll('pr-archive-small').length).toBe(1);
	});

	it('should pass up a selected archive', async () => {
		const pendingArchives: ArchiveVO[] = [
			new ArchiveVO({
				fullName: 'Pending Test',
			}),
		];
		const fixture = await defaultRender(pendingArchives);
		const instance = fixture.point.componentInstance;
		const selectInvitationSpy = spyOn(
			fixture.point.componentInstance.selectInvitation,
			'emit',
		);
		instance.selectPendingArchive(pendingArchives[0]);

		expect(selectInvitationSpy).toHaveBeenCalledWith(pendingArchives[0]);
	});
});
