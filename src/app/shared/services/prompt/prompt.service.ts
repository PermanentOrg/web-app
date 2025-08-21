import { Injectable } from '@angular/core';
import {
	UntypedFormBuilder,
	UntypedFormGroup,
	ValidationErrors,
} from '@angular/forms';
import debug from 'debug';

import {
	FormInputConfig,
	FormInputSelectOption,
} from '@shared/components/form-input/form-input.component';

import { PromptComponent } from '@shared/components/prompt/prompt.component';

export * from '@shared/components/prompt/prompt-fields';

export interface PromptField {
	fieldName: string;
	placeholder: string;
	initialValue?: any;
	type?: 'text' | 'tel' | 'select' | 'number' | 'email' | 'date';
	selectOptions?: FormInputSelectOption[];
	config?: FormInputConfig;
	validators?: ValidationErrors[];
}

export interface PromptButton {
	buttonName: string;
	buttonText: string;
	value?: any;
	class?: string;
}

export interface PromptConfig {
	form?: UntypedFormGroup;
	fields?: PromptField[];
	buttons?: PromptButton[];
	template?: string;
	title: string;
	savePromise?: Promise<any>;
	saveText?: string;
	cancelText?: string;
	donePromise?: Promise<any>;
	doneResolve?: Function;
	doneReject?: Function;
}

@Injectable({
	providedIn: 'root',
})
export class PromptService {
	private component: PromptComponent;
	private debug = debug('service:promptService');

	constructor(private fb: UntypedFormBuilder) {
		this.debug('created');
	}

	registerComponent(toRegister: PromptComponent) {
		if (this.component) {
			throw new Error('PromptService - Prompt component already registered');
		}

		this.component = toRegister;
		this.debug('component registered');
	}

	unregisterComponent() {
		this.component = null;
		this.debug('component unregistered');
	}

	async prompt(
		fields: PromptField[],
		title: string,
		savePromise?: Promise<any>,
		saveText?: string,
		cancelText?: string,
		template?: string,
	): Promise<any> {
		if (!this.component) {
			throw new Error('PromptService - Missing prompt component');
		}

		const formConfig = {};

		for (const field of fields) {
			formConfig[field.fieldName] = [
				field.initialValue || '',
				field.validators || [],
			];
		}

		return await this.component.prompt(
			this.fb.group(formConfig),
			fields,
			title,
			savePromise,
			saveText,
			cancelText,
			null,
			null,
			null,
			template,
		);
	}

	async promptButtons(
		buttons: PromptButton[],
		title: string,
		savePromise?: Promise<any>,
		template?: string,
	): Promise<any> {
		if (!this.component) {
			throw new Error('PromptService - Missing prompt component');
		}

		return await this.component.promptButtons(
			buttons,
			title,
			savePromise,
			null,
			null,
			null,
			template,
		);
	}

	async confirm(
		confirmText: string = 'OK',
		title: string,
		savePromise?: Promise<any>,
		confirmButtonClass?: string,
		template?: string,
	): Promise<any> {
		const confirmButtons: PromptButton[] = [
			{
				buttonName: 'confirm',
				buttonText: confirmText || 'OK',
				class: confirmButtonClass || undefined,
			},
			{
				buttonName: 'cancel',
				buttonText: 'Cancel',
				class: 'btn-secondary',
			},
		];

		return await this.promptButtons(
			confirmButtons,
			title,
			savePromise,
			template,
		).then(async (value: string) => {
			if (value === 'confirm') {
				return await Promise.resolve(true);
			} else {
				return await Promise.reject(false);
			}
		});
	}

	async confirmBoolean(
		confirmText: string = 'OK',
		title: string,
		savePromise?: Promise<any>,
		confirmButtonClass?: string,
		template?: string,
	) {
		return await this.confirm(
			confirmText,
			title,
			savePromise,
			confirmButtonClass,
			template,
		).catch(async (err) => await Promise.resolve(false));
	}

	getInput(fieldName: string) {
		return this.component.getInput(fieldName);
	}
}
