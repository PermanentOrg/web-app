/* @format */
import { Shallow } from 'shallow-render';
import { UserChecklistModule } from '../../user-checklist.module';
import { UserChecklistComponent } from './user-checklist.component';

describe('UserChecklistComponent', () => {
  let shallow: Shallow<UserChecklistComponent>;

  beforeEach(async () => {
    shallow = new Shallow(UserChecklistComponent, UserChecklistModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });
});
