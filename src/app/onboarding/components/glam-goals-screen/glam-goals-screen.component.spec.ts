/* @format */
import { Shallow } from 'shallow-render';
import { OnboardingModule } from '../../onboarding.module';
import { goals } from '../../shared/onboarding-screen';
import { GlamGoalsScreenComponent } from './glam-goals-screen.component';

describe('GlamGoalsScreenComponent', () => {
  let shallow:Shallow<GlamGoalsScreenComponent>

  beforeEach(async () => {
    shallow = new Shallow(GlamGoalsScreenComponent, OnboardingModule)
  });

  it('should create', async() => {
    const {instance} = await shallow.render()

    expect(instance).toBeTruthy();
  });

  it('should initialize goals from shared/onboarding-screen', async () => {
    const { instance } = await shallow.render();

    expect(instance.goals).toEqual(goals);
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

    expect(outputs.backToNameArchiveOutput.emit).toHaveBeenCalledWith('name-archive');
  });

  it('should emit goToNextReasonsOutput with selectedGoals when goToNextReasons is called', async () => {
    const { instance, outputs } = await shallow.render();
    const goal = 'Test Goal';
    instance.addGoal(goal);
    instance.goToNextReasons();

    expect(outputs.goToNextReasonsOutput.emit).toHaveBeenCalledWith({
      screen: 'reasons',
      goals: [goal],
    });
  });
});
