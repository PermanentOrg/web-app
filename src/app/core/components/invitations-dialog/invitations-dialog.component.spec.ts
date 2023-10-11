/* @format */
import { ApiService } from '@shared/services/api/api.service';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { InviteVO } from '@root/app/models';
import { CoreModule } from '@core/core.module';
import { Shallow } from 'shallow-render';
import { MessageService } from '@shared/services/message/message.service';
import { InvitationsDialogComponent } from './invitations-dialog.component';

const mockApiService = {
  invite: {
    getInvites(): Promise<InviteVO[]> {
      return Promise.resolve([new InviteVO({ email: 'testEmail1@test.com' })]);
    },
  },
};

describe('InvitationsDialog', () => {
  let shallow: Shallow<InvitationsDialogComponent>;
  const dialogRef = new DialogRef(1, null);
  let messageShown: boolean = false;

  beforeEach(() => {
    shallow = new Shallow(InvitationsDialogComponent, CoreModule)
      .mock(DIALOG_DATA, { useValue: {} })
      .mock(DialogRef, dialogRef)
      .mock(ApiService, mockApiService)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      });
  });

  it('should exist', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });

  it('should display the pending invitations table if there are any invitations pending', async () => {
    const { fixture, find, instance } = await shallow.render();
    instance.activeTab = 'pending';
    instance.pendingInvites = [new InviteVO({ email: 'testEmail1@test.com' })];

    fixture.detectChanges();

    const table = find('.invitation');

    expect(table.length).toBe(instance.pendingInvites.length);
  });

  it('should display the "no pending invites" message if there are no invites', async () => {
    const { fixture, find, instance } = await shallow.render();
    instance.activeTab = 'pending';
    instance.pendingInvites = [];

    fixture.detectChanges();

    const message = find('.text-muted');

    expect(message).not.toBeNull();
  });

  it('should display the accepted invitations table if there are any accepted pending', async () => {
    const { fixture, find, instance } = await shallow.render();
    instance.activeTab = 'accepted';
    instance.acceptedInvites = [new InviteVO({ email: 'testEmail1@test.com' })];

    fixture.detectChanges();

    const table = find('.invitation');

    expect(table.length).toBe(instance.acceptedInvites.length);
  });

  it('should display the "no accepted invites" message if there are no invites', async () => {
    const { fixture, find, instance } = await shallow.render();
    instance.activeTab = 'accepted';
    instance.acceptedInvites = [];

    fixture.detectChanges();

    const message = find('.text-muted');

    expect(message).not.toBeNull();
  });
});
