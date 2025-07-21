import { AccountVO } from '@models/account-vo';
import { isNull, omitBy } from 'lodash';
import { MessageService } from '../message/message.service';
import { ApiService } from '../api/api.service';
import { AccountService } from './account.service';

interface SavePropertyOnAccountServices {
	messageService: MessageService;
	accountService: AccountService;
	apiService: ApiService;
}

export interface AccountChange {
	prop: keyof AccountVO;
	value: string;
}

export async function savePropertyOnAccount(
	account: AccountVO,
	change: AccountChange,
	services: SavePropertyOnAccountServices,
) {
	const originalValue = account[change.prop];
	const updateData = {
		primaryEmail: account.primaryEmail,
		[change.prop]: change.value,
		phoneStatus:
			change.prop === 'primaryPhone' && change.value === ''
				? 'status.auth.unverified'
				: account.phoneStatus,
	};
	account.update(updateData);
	try {
		const response = omitBy(
			await services.apiService.account.update(updateData),
			isNull,
		);
		account.update(response);
		services.accountService.setAccount(account);
		services.messageService.showMessage({
			message: 'Account information saved.',
			style: 'success',
		});
	} catch (err) {
		account.update({
			[change.prop]: originalValue,
		});
		services.messageService.showError({
			message: 'There was a problem saving your account changes',
		});
	}
}
