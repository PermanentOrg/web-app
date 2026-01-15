import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AccountVO, InviteVO } from '@root/app/models';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { InvitationsDialogComponent } from './invitations-dialog.component';

@NgModule()
class DummyModule {}

const mockAccountService = {
	getAccount: () =>
		new AccountVO({
			accountId: 1,
		}),
};

class DialogRefMock {
	close() {}
}

const mockApiService = {
	invite: {
		async getInvites(): Promise<InviteVO[]> {
			return await Promise.resolve([
				new InviteVO({ email: 'testEmail1@test.com' }),
			]);
		},
	},
};

describe('InvitationsDialog', () => {
	beforeEach(
		async () =>
			await MockBuilder(InvitationsDialogComponent, DummyModule)
				.keep(ReactiveFormsModule, { export: true })
				.keep(UntypedFormBuilder)
				.provide({
					provide: DIALOG_DATA,
					useValue: {},
				})
				.provide({
					provide: DialogRef,
					useClass: DialogRefMock,
				})
				.provide({
					provide: AccountService,
					useValue: mockAccountService,
				})
				.provide({
					provide: ApiService,
					useValue: mockApiService,
				})
				.provide({
					provide: MessageService,
					useValue: {
						showError: () => {},
					},
				}),
	);

	it('exists', () => {
		const fixture = MockRender(InvitationsDialogComponent);

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('displays the pending invitations table if there are any invitations pending', () => {
		const fixture = MockRender(InvitationsDialogComponent);
		const instance = fixture.point.componentInstance;
		instance.activeTab = 'pending';
		instance.pendingInvites = [new InviteVO({ email: 'testEmail1@test.com' })];

		fixture.detectChanges();

		const table = ngMocks.findAll('.invitation');

		expect(table.length).toBe(instance.pendingInvites.length);
	});

	it('displays the "no pending invites" message if there are no invites', () => {
		const fixture = MockRender(InvitationsDialogComponent);
		const instance = fixture.point.componentInstance;
		instance.activeTab = 'pending';
		instance.pendingInvites = [];

		fixture.detectChanges();

		const message = ngMocks.find('.text-muted');

		expect(message).not.toBeNull();
	});

	it('displays the accepted invitations table if there are any accepted pending', () => {
		const fixture = MockRender(InvitationsDialogComponent);
		const instance = fixture.point.componentInstance;
		instance.activeTab = 'accepted';
		instance.acceptedInvites = [new InviteVO({ email: 'testEmail1@test.com' })];

		fixture.detectChanges();

		const table = ngMocks.findAll('.invitation');

		expect(table.length).toBe(instance.acceptedInvites.length);
	});

	it('displays the "no accepted invites" message if there are no invites', () => {
		const fixture = MockRender(InvitationsDialogComponent);
		const instance = fixture.point.componentInstance;
		instance.activeTab = 'accepted';
		instance.acceptedInvites = [];

		fixture.detectChanges();

		const message = ngMocks.find('.text-muted');

		expect(message).not.toBeNull();
	});

	it('displays the gifted amount in the table if there is any, otherwise display the "None Given" text', () => {
		const fixture = MockRender(InvitationsDialogComponent);
		const instance = fixture.point.componentInstance;
		instance.activeTab = 'pending';
		instance.pendingInvites = [
			new InviteVO({ email: 'test1@example.com', giftSizeInMB: 1024 }),
			new InviteVO({ email: 'test2@example.com', giftSizeInMB: null }),
			new InviteVO({ email: 'test3@example.com', giftSizeInMB: 1024 }),
			new InviteVO({ email: 'test4@example.com', giftSizeInMB: null }),
			new InviteVO({ email: 'test5@example.com', giftSizeInMB: 1024 }),
		];

		fixture.detectChanges();

		const invitesWithGift = ngMocks.findAll('.has-amount');
		const invitesWithoutGift = ngMocks.findAll('.none');

		expect(invitesWithGift.length).toBe(3);
		expect(invitesWithoutGift.length).toBe(2);
	});

	it('displays the amount sent in the invite', () => {
		const fixture = MockRender(InvitationsDialogComponent);
		const instance = fixture.point.componentInstance;
		instance.activeTab = 'pending';
		instance.pendingInvites = [
			new InviteVO({ email: 'test1@example.com', giftSizeInMB: 1024 }),
			new InviteVO({ email: 'test2@example.com', giftSizeInMB: 2048 }),
			new InviteVO({ email: 'test3@example.com', giftSizeInMB: 1024 }),
		];

		fixture.detectChanges();

		const invitesWithGift = ngMocks.findAll('.has-amount');

		const giftedAmount = invitesWithGift[1].nativeElement.textContent.trim();

		const expectedText = `${instance.pendingInvites[1].giftSizeInMB / 1024} GB`;

		expect(giftedAmount).toBe(expectedText);
	});

	it('displays the "None given" text if no amount was sent in the invite', () => {
		const fixture = MockRender(InvitationsDialogComponent);
		const instance = fixture.point.componentInstance;
		instance.activeTab = 'pending';
		instance.pendingInvites = [
			new InviteVO({ email: 'test1@example.com', giftSizeInMB: 1024 }),
			new InviteVO({ email: 'test2@example.com', giftSizeInMB: null }),
			new InviteVO({ email: 'test3@example.com', giftSizeInMB: 1024 }),
		];

		fixture.detectChanges();

		const invitesWithGift = ngMocks.findAll('.invitation .amount');

		const giftedAmount = invitesWithGift[1].nativeElement.textContent.trim();

		const expectedText = `None given`;

		expect(giftedAmount).toBe(expectedText);
	});
});
