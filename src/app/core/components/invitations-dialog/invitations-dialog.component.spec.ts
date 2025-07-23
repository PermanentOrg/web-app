/* @format */
import { ApiService } from '@shared/services/api/api.service';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AccountVO, InviteVO } from '@root/app/models';
import { CoreModule } from '@core/core.module';
import { Shallow } from 'shallow-render';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { InvitationsDialogComponent } from './invitations-dialog.component';

const mockAccountService = {
	getAccount: () => {
		return new AccountVO({
			accountId: 1,
		});
	},
};

class DialogRefMock {
	close() {}
}

const mockApiService = {
	invite: {
		getInvites(): Promise<InviteVO[]> {
			return Promise.resolve([new InviteVO({ email: 'testEmail1@test.com' })]);
		},
	},
};

describe('InvitationsDialog', () => {
	let shallow: Shallow<InvitationsDialogComponent>;
	let messageShown: boolean = false;

	beforeEach(() => {
		shallow = new Shallow(InvitationsDialogComponent, CoreModule)
			.mock(DIALOG_DATA, { useValue: {} })
			.provide({
				provide: DialogRef,
				useClass: DialogRefMock,
			})
			.mock(AccountService, mockAccountService)
			.mock(ApiService, mockApiService)
			.mock(MessageService, {
				showError: () => {
					messageShown = true;
				},
			});
	});

	it('exists', async () => {
		const { element } = await shallow.render();

		expect(element).not.toBeNull();
	});

	it('displays the pending invitations table if there are any invitations pending', async () => {
		const { fixture, find, instance } = await shallow.render();
		instance.activeTab = 'pending';
		instance.pendingInvites = [new InviteVO({ email: 'testEmail1@test.com' })];

		fixture.detectChanges();

		const table = find('.invitation');

		expect(table.length).toBe(instance.pendingInvites.length);
	});

	it('displays the "no pending invites" message if there are no invites', async () => {
		const { fixture, find, instance } = await shallow.render();
		instance.activeTab = 'pending';
		instance.pendingInvites = [];

		fixture.detectChanges();

		const message = find('.text-muted');

		expect(message).not.toBeNull();
	});

	it('displays the accepted invitations table if there are any accepted pending', async () => {
		const { fixture, find, instance } = await shallow.render();
		instance.activeTab = 'accepted';
		instance.acceptedInvites = [new InviteVO({ email: 'testEmail1@test.com' })];

		fixture.detectChanges();

		const table = find('.invitation');

		expect(table.length).toBe(instance.acceptedInvites.length);
	});

	it('displays the "no accepted invites" message if there are no invites', async () => {
		const { fixture, find, instance } = await shallow.render();
		instance.activeTab = 'accepted';
		instance.acceptedInvites = [];

		fixture.detectChanges();

		const message = find('.text-muted');

		expect(message).not.toBeNull();
	});

	it('displays the gifted amount in the table if there is any, otherwise display the "None Given" text', async () => {
		const { fixture, find, instance } = await shallow.render();
		instance.activeTab = 'pending';
		instance.pendingInvites = [
			new InviteVO({ email: 'test1@example.com', giftSizeInMB: 1024 }),
			new InviteVO({ email: 'test2@example.com', giftSizeInMB: null }),
			new InviteVO({ email: 'test3@example.com', giftSizeInMB: 1024 }),
			new InviteVO({ email: 'test4@example.com', giftSizeInMB: null }),
			new InviteVO({ email: 'test5@example.com', giftSizeInMB: 1024 }),
		];

		fixture.detectChanges();

		const invitesWithGift = find('.has-amount');
		const invitesWithoutGift = find('.none');

		expect(invitesWithGift.length).toBe(3);
		expect(invitesWithoutGift.length).toBe(2);
	});

	it('displays the amount sent in the invite', async () => {
		const { fixture, find, instance } = await shallow.render();
		instance.activeTab = 'pending';
		instance.pendingInvites = [
			new InviteVO({ email: 'test1@example.com', giftSizeInMB: 1024 }),
			new InviteVO({ email: 'test2@example.com', giftSizeInMB: 2048 }),
			new InviteVO({ email: 'test3@example.com', giftSizeInMB: 1024 }),
		];

		fixture.detectChanges();

		const invitesWithGift = find('.has-amount');

		const giftedAmount = invitesWithGift[1].nativeElement.textContent.trim();

		const expectedText = `${instance.pendingInvites[1].giftSizeInMB / 1024} GB`;

		expect(giftedAmount).toBe(expectedText);
	});

	it('displays the "None given" text if no amount was sent in the invite', async () => {
		const { fixture, find, instance } = await shallow.render();
		instance.activeTab = 'pending';
		instance.pendingInvites = [
			new InviteVO({ email: 'test1@example.com', giftSizeInMB: 1024 }),
			new InviteVO({ email: 'test2@example.com', giftSizeInMB: null }),
			new InviteVO({ email: 'test3@example.com', giftSizeInMB: 1024 }),
		];

		fixture.detectChanges();

		const invitesWithGift = find('.invitation .amount');

		const giftedAmount = invitesWithGift[1].nativeElement.textContent.trim();

		const expectedText = `None given`;

		expect(giftedAmount).toBe(expectedText);
	});
});
