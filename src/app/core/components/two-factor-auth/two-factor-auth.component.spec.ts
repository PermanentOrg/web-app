/* @format */
import { Shallow } from 'shallow-render';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFactorAuthComponent } from './two-factor-auth.component';
import { CoreModule } from '@core/core.module';
import { MessageService } from '@shared/services/message/message.service';

describe('TwoFactorAuthComponent', () => {
  let shallow: Shallow<TwoFactorAuthComponent>;
  let messageShown: boolean = false;

  beforeEach(async () => {
    messageShown = false;
    shallow = new Shallow(TwoFactorAuthComponent, CoreModule).mock(MessageService, {
      showError: () => {
        messageShown = true;
      },
    });

    it('should create', async () => {
      const { instance } = await shallow.render();
      expect(instance).toBeTruthy();
    });
  });
});
