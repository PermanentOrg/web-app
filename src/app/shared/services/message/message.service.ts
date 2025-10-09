import { Injectable } from '@angular/core';
import { MessageComponent } from '@shared/components/message/message.component';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

type MessageType = 'success' | 'info' | 'warning' | 'danger';

export interface MessageDisplayOptions {
	message: string;
	style?: MessageType;
	translate?: boolean;
	navigateTo?: string[];
	navigateParams?: any;
	externalUrl?: string;
	externalMessage?: string;
}

@Injectable()
export class MessageService {
	private component: MessageComponent;

	constructor(private constants: PrConstantsService) {}

	registerComponent(toRegister: MessageComponent) {
		if (this.component) {
			throw new Error('MessageService - Message component already registered');
		}

		this.component = toRegister;
	}

	public showMessage(data: MessageDisplayOptions) {
		if (!this.component) {
			throw new Error('MessageService - Missing component');
		}

		const { translate } = data;

		if (translate) {
			this.component.display({
				message: this.constants.translate(data.message),
				...data,
			});
		} else {
			this.component.display(data);
		}
	}

	public showError(data: MessageDisplayOptions) {
		return this.showMessage({ style: 'danger', ...data });
	}
}
