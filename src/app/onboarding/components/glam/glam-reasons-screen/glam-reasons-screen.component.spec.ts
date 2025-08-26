import { Shallow } from 'shallow-render';
import { OnboardingModule } from '../../../onboarding.module';
import { reasons } from '../../../shared/onboarding-screen';
import { GlamReasonsScreenComponent } from './glam-reasons-screen.component';

describe('GlamReasonsScreenComponent', () => {
	let shallow: Shallow<GlamReasonsScreenComponent>;

	beforeEach(async () => {
		shallow = new Shallow(GlamReasonsScreenComponent, OnboardingModule);

		spyOn(sessionStorage, 'getItem').and.callFake((key) => {
			const store = {
				reasons: JSON.stringify(['Mock Reason']),
			};
			return store[key] || null;
		});

		spyOn(sessionStorage, 'setItem').and.callFake((key, value) => {});
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should initialize reasons from shared/onboarding-screen', async () => {
		const { instance } = await shallow.render();

		expect(instance.reasons).toEqual(reasons);
	});

	it('should initialize selectedReasons from sessionStorage', async () => {
		const { instance } = await shallow.render();

		expect(sessionStorage.getItem).toHaveBeenCalledWith('reasons');
		expect(instance.selectedReasons).toEqual(['Mock Reason']);
	});

	it('should update sessionStorage when addReason is called', async () => {
		const { instance } = await shallow.render();
		const reason = 'Test Reason';

		instance.addReason(reason);

		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'reasons',
			JSON.stringify(['Mock Reason', 'Test Reason']),
		);
	});

	it('should add reason to selectedReasons when addReason is called', async () => {
		const { instance } = await shallow.render();
		const reason = 'Test Reason';
		instance.addReason(reason);

		expect(instance.selectedReasons).toContain(reason);
	});

	it('should remove reason from selectedReasons when addReason is called twice', async () => {
		const { instance } = await shallow.render();
		const reason = 'Test Reason';
		instance.addReason(reason);
		instance.addReason(reason);

		expect(instance.selectedReasons).not.toContain(reason);
	});

	it('should emit reasonsEmit with selectedReasons when finalizeArchive is called', async () => {
		const { instance, outputs } = await shallow.render();
		const reason = 'Test Reason';
		instance.addReason(reason);
		instance.finalizeArchive();

		expect(outputs.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'finalize',
			reasons: ['Mock Reason', reason],
		});
	});

	it('should emit reasonsEmit with selectedReasons when backToGoals is called', async () => {
		const { instance, outputs } = await shallow.render();
		const reason = 'Test Reason';
		instance.addReason(reason);
		instance.backToGoals();

		expect(outputs.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'goals',
			reasons: ['Mock Reason', reason],
		});
	});

	it('should clear selectedReasons and update sessionStorage when skipStep is called', async () => {
		const { instance } = await shallow.render();

		expect(instance.selectedReasons).toEqual(['Mock Reason']);

		instance.skipStep();

		expect(instance.selectedReasons).toEqual([]);
		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'reasons',
			JSON.stringify([]),
		);
	});

	it('should emit reasonOutput with empty reasons when skipStep is called', async () => {
		const { instance, outputs } = await shallow.render();

		instance.skipStep();

		expect(outputs.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'finalize',
			reasons: [],
		});
	});
});
