/* @format */
import { Shallow } from 'shallow-render';
import { fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { DialogModule } from './dialog.module';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let shallow: Shallow<DialogComponent>;

  beforeEach(waitForAsync(() => {
    shallow = new Shallow(DialogComponent, DialogModule);
  }));

  it('should create', async () => {
    const { instance } = await shallow.render();
    expect(instance).toBeTruthy();
  });

  it('toggles visibility on show and hide', fakeAsync(async () => {
    const { instance } = await shallow.render();
    instance.show();
    tick();
    expect(instance.isVisible).toBeTrue();
    instance.hide();
    expect(instance.isVisible).toBeFalse();
  }));

  it('sets options correctly', async () => {
    const { instance } = await shallow.render();
    instance.setOptions({ width: '100px', borderRadius: '10px' });
    expect(instance.width).toEqual('100px');
    expect(instance.borderRadius).toEqual('10px');
  });
  it('closes dialog on menu wrapper click', async () => {
    const { instance, find } = await shallow.render();
    spyOn(instance, 'onMenuWrapperClick').and.callThrough();
    find('.menu-wrapper').triggerEventHandler('mousedown', {});
    expect(instance.onMenuWrapperClick).toHaveBeenCalled();
  });
});
