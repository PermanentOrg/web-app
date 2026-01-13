import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { goals } from '../../../shared/onboarding-screen';
import { GlamGoalsScreenComponent } from './glam-goals-screen.component';

describe('GlamGoalsScreenComponent', () => {
	let component: GlamGoalsScreenComponent;
	let fixture: ComponentFixture<GlamGoalsScreenComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GlamGoalsScreenComponent],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		spyOn(sessionStorage, 'getItem').and.callFake((key) => {
			const store: { [key: string]: string } = {
				goals: JSON.stringify(['Mock Goal']),
			};
			return store[key] || null;
		});

		spyOn(sessionStorage, 'setItem').and.callFake((key, value) => {});

		fixture = TestBed.createComponent(GlamGoalsScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize goals from shared/onboarding-screen', () => {
		expect(component.goals).toEqual(goals);
	});

	it('should initialize selectedGoals from sessionStorage', () => {
		expect(sessionStorage.getItem).toHaveBeenCalledWith('goals');
		expect(component.selectedGoals).toEqual(['Mock Goal']);
	});

	it('should update sessionStorage when addGoal is called', () => {
		const goal = 'Test Goal';

		component.addGoal(goal);

		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'goals',
			JSON.stringify(['Mock Goal', 'Test Goal']),
		);
	});

	it('should add goal to selectedGoals when addGoal is called', () => {
		const goal = 'Test Goal';
		component.addGoal(goal);

		expect(component.selectedGoals).toContain(goal);
	});

	it('should remove goal from selectedGoals when addGoal is called twice', () => {
		const goal = 'Test Goal';
		component.addGoal(goal);
		component.addGoal(goal);

		expect(component.selectedGoals).not.toContain(goal);
	});

	it('should emit backToNameArchiveOutput when backToNameArchive is called', () => {
		spyOn(component.goalsOutput, 'emit');
		component.backToNameArchive();

		expect(component.goalsOutput.emit).toHaveBeenCalledWith({
			screen: 'name-archive',
			goals: ['Mock Goal'],
		});
	});

	it('should emit goToNextReasonsOutput with selectedGoals when goToNextReasons is called', () => {
		spyOn(component.goalsOutput, 'emit');
		const goal = 'Test Goal';
		component.addGoal(goal);
		component.goToNextReasons();

		expect(component.goalsOutput.emit).toHaveBeenCalledWith({
			screen: 'reasons',
			goals: ['Mock Goal', goal],
		});
	});

	it('should clear selectedGoals and update sessionStorage when skipStep is called', () => {
		expect(component.selectedGoals).toEqual(['Mock Goal']);

		component.skipStep();

		expect(component.selectedGoals).toEqual([]);
		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'goals',
			JSON.stringify([]),
		);
	});

	it('should emit goalsOutput with empty goals when skipStep is called', () => {
		spyOn(component.goalsOutput, 'emit');

		component.skipStep();

		expect(component.goalsOutput.emit).toHaveBeenCalledWith({
			screen: 'reasons',
			goals: [],
		});
	});
});
