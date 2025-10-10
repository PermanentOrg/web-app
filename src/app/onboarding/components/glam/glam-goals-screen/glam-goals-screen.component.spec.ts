import { Shallow } from 'shallow-render';
import { OnboardingModule } from '../../../onboarding.module';
import { goals } from '../../../shared/onboarding-screen';
import { GlamGoalsScreenComponent } from './glam-goals-screen.component';

describe('GlamGoalsScreenComponent', () => {
	let shallow: Shallow<GlamGoalsScreenComponent>;

	beforeEach(async () => {
		shallow = new Shallow(GlamGoalsScreenComponent, OnboardingModule);

		spyOn(sessionStorage, 'getItem').and.callFake((key) => {
			const store = {
				goals: JSON.stringify(['Mock Goal']),
			};
			return store[key] || null;
		});

		spyOn(sessionStorage, 'setItem').and.callFake((key, value) => {});
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should initialize goals from shared/onboarding-screen', async () => {
		const { instance } = await shallow.render();

		expect(instance.goals).toEqual(goals);
	});

	it('should initialize selectedGoals from sessionStorage', async () => {
		const { instance } = await shallow.render();

		expect(sessionStorage.getItem).toHaveBeenCalledWith('goals');
		expect(instance.selectedGoals).toEqual(['Mock Goal']);
	});

	it('should update sessionStorage when addGoal is called', async () => {
		const { instance } = await shallow.render();
		const goal = 'Test Goal';

		instance.addGoal(goal);

		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'goals',
			JSON.stringify(['Mock Goal', 'Test Goal']),
		);
	});

	it('should add goal to selectedGoals when addGoal is called', async () => {
		const { instance } = await shallow.render();
		const goal = 'Test Goal';
		instance.addGoal(goal);

		expect(instance.selectedGoals).toContain(goal);
	});

	it('should remove goal from selectedGoals when addGoal is called twice', async () => {
		const { instance } = await shallow.render();
		const goal = 'Test Goal';
		instance.addGoal(goal);
		instance.addGoal(goal);

		expect(instance.selectedGoals).not.toContain(goal);
	});

	it('should emit backToNameArchiveOutput when backToNameArchive is called', async () => {
		const { instance, outputs } = await shallow.render();
		instance.backToNameArchive();

		expect(outputs.goalsOutput.emit).toHaveBeenCalledWith({
			screen: 'name-archive',
			goals: ['Mock Goal'],
		});
	});

	it('should emit goToNextReasonsOutput with selectedGoals when goToNextReasons is called', async () => {
		const { instance, outputs } = await shallow.render();
		const goal = 'Test Goal';
		instance.addGoal(goal);
		instance.goToNextReasons();

		expect(outputs.goalsOutput.emit).toHaveBeenCalledWith({
			screen: 'reasons',
			goals: ['Mock Goal', goal],
		});
	});

	it('should clear selectedGoals and update sessionStorage when skipStep is called', async () => {
		const { instance } = await shallow.render();

		expect(instance.selectedGoals).toEqual(['Mock Goal']);

		instance.skipStep();

		expect(instance.selectedGoals).toEqual([]);
		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'goals',
			JSON.stringify([]),
		);
	});

	it('should emit goalsOutput with empty goals when skipStep is called', async () => {
		const { instance, outputs } = await shallow.render();

		instance.skipStep();

		expect(outputs.goalsOutput.emit).toHaveBeenCalledWith({
			screen: 'reasons',
			goals: [],
		});
	});
});
