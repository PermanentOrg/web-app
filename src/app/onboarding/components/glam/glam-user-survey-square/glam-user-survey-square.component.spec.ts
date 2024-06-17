/* @format */
import { Shallow } from 'shallow-render';
import { OnboardingModule } from '@root/app/onboarding/onboarding.module';
import { GlamUserSurveySquareComponent } from './glam-user-survey-square.component';

describe('GlamUserSurveySquareComponent', () => {
  let shallow: Shallow<GlamUserSurveySquareComponent>;

  beforeEach(async () => {
    shallow = new Shallow(GlamUserSurveySquareComponent, OnboardingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });
  
  it('should display the text correctly', async () => {
    const text = 'Test Text';
    const { fixture, find } = await shallow.render({ bind: { text } });
    const textElement = find('.text');

    expect(textElement.nativeElement.textContent).toContain(text);
  });

  it('should toggle selected state and emit selectedChange when clicked', async () => {
    const tag = 'test-tag';
    const { instance, outputs, fixture, find } = await shallow.render({
      bind: { tag },
    });
    const squareElement = find('.square');
    squareElement.triggerEventHandler('click', null);

    expect(instance.selected).toBeTrue();
    expect(outputs.selectedChange.emit).toHaveBeenCalledWith(tag);

    squareElement.triggerEventHandler('click', null);

    expect(instance.selected).toBeFalse();
    expect(outputs.selectedChange.emit).toHaveBeenCalledWith(tag);
  });

  it('should add selected class when selected is true', async () => {
    const { fixture, find } = await shallow.render({
      bind: { selected: true },
    });
    const squareElement = find('.square');

    expect(squareElement.classes['selected']).toBeTrue();
  });
});
