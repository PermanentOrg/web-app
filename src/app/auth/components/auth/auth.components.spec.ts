/* @format */
import { Shallow } from 'shallow-render';
import { AuthRoutingModule } from '@auth/auth.routes';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
  let shallow: Shallow<AuthComponent>;

  beforeEach(async () => {
    shallow = new Shallow(AuthComponent, AuthRoutingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });
});
