/* @format */
import { Shallow } from 'shallow-render';
import { OnboardingModule } from '../../onboarding.module';
import { reasons } from '../../shared/onboarding-screen';
import { GlamReasonsScreenComponent } from './glam-reasons-screen.component';

describe('GlamReasonsScreenComponent', () => {
  let shallow: Shallow<GlamReasonsScreenComponent>;

  beforeEach(async () => {
    shallow = new Shallow(GlamReasonsScreenComponent, OnboardingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should initialize reasons from shared/onboarding-screen', async () => {
    const { instance } = await shallow.render();

    expect(instance.reasons).toEqual(reasons);
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

  it('should emit backToGoalsOutput when backToGoals is called', async () => {
    const { instance, outputs } = await shallow.render();
    instance.backToGoals();

    expect(outputs.backToGoalsOutput.emit).toHaveBeenCalledWith('goals');
  });

  it('should emit finalizeArchiveOutput with selectedReasons when finalizeArchive is called', async () => {
    const { instance, outputs } = await shallow.render();
    const reason = 'Test Reason';
    instance.addReason(reason);
    instance.finalizeArchive();

    expect(outputs.finalizeArchiveOutput.emit).toHaveBeenCalledWith({
      screen: 'finalize',
      reasons: [reason],
    });
  });
});
