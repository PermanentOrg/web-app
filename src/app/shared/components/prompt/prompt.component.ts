import {
	Component,
	Input,
	ElementRef,
	OnDestroy,
	ViewChildren,
	QueryList,
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import {
	PromptService,
	PromptField,
	PromptButton,
	PromptConfig,
} from '@shared/services/prompt/prompt.service';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

const DEFAULT_SAVE_TEXT = 'OK';
const DEFAULT_CANCEL_TEXT = 'Cancel';

@Component({
	selector: 'pr-prompt',
	templateUrl: './prompt.component.html',
	styleUrls: ['./prompt.component.scss'],
	standalone: false,
})
export class PromptComponent implements OnDestroy {
	@Input() isVisible: boolean;

	@ViewChildren(FormInputComponent) inputQuery: QueryList<FormInputComponent>;

	public waiting = false;
	public editForm: UntypedFormGroup;
	public fields: any[] = [];
	public placeholderText = 'test';
	public title: string;

	public editButtons: PromptButton[];

	public template: string;
	public saveText = DEFAULT_SAVE_TEXT;
	public cancelText = DEFAULT_CANCEL_TEXT;

	public savePromise: Promise<any>;

	public donePromise: Promise<any>;
	public doneResolve: Function;
	public doneReject: Function;

	private defaultForm: UntypedFormGroup;

	private promptQueue: PromptConfig[] = [];

	constructor(
		private service: PromptService,
		private fb: UntypedFormBuilder,
		private element: ElementRef,
	) {
		this.service.registerComponent(this);
		this.defaultForm = fb.group({});
	}

	ngOnDestroy() {
		this.service.unregisterComponent();
	}

	hide(event: Event) {
		this.isVisible = false;
		setTimeout(() => {
			this.reset();
		}, 500);
		return false;
	}

	async prompt(
		form: UntypedFormGroup,
		fields: PromptField[],
		title: string,
		savePromise?: Promise<any>,
		saveText?: string,
		cancelText?: string,
		donePromise?: Promise<any>,
		doneResolve?: Function,
		doneReject?: Function,
		template?: string,
	) {
		if (this.donePromise) {
			let newDoneReject, newDoneResolve;

			const newDonePromise = new Promise((resolve, reject) => {
				newDoneResolve = resolve;
				newDoneReject = reject;
			});

			this.promptQueue.push({
				form,
				fields,
				title,
				savePromise,
				saveText,
				cancelText,
				donePromise: newDonePromise,
				doneResolve: newDoneResolve,
				doneReject: newDoneReject,
			});

			return await newDonePromise;
		}

		this.title = title;
		this.savePromise = savePromise;

		this.template = template;
		this.saveText = saveText || DEFAULT_SAVE_TEXT;
		this.cancelText = cancelText || DEFAULT_CANCEL_TEXT;
		this.template = template;

		this.editForm = form;
		this.fields = fields;

		if (donePromise) {
			this.donePromise = donePromise;
			this.doneResolve = doneResolve;
			this.doneReject = doneReject;
		} else {
			this.donePromise = new Promise((resolve, reject) => {
				this.doneResolve = resolve;
				this.doneReject = reject;
			});
		}

		this.isVisible = true;

		setTimeout(() => {
			const elem = this.element.nativeElement as Element;
			const firstInput = elem.querySelector('input');
			if (firstInput) {
				firstInput.focus();
			}
		}, 32);

		return await this.donePromise;
	}

	save(event: Event) {
		event.stopPropagation();
		this.doneResolve(this.editForm.value);
		if (this.savePromise) {
			this.waiting = true;
			this.savePromise
				.then(() => {
					this.waiting = false;
					this.hide(event);
				})
				.catch(() => {
					this.waiting = false;
					this.hide(event);
				});
		} else {
			this.hide(event);
		}
		return false;
	}

	cancel(event: Event) {
		event.stopPropagation();
		this.doneReject();
		this.hide(event);
		return false;
	}

	getInput(fieldName: string) {
		const component = this.inputQuery.find(
			(input) => input.fieldName === fieldName,
		);
		if (component) {
			return component
				.getElement()
				.nativeElement.querySelector('.form-control');
		} else {
			return null;
		}
	}

	async promptButtons(
		buttons: PromptButton[],
		title: string,
		savePromise?: Promise<any>,
		donePromise?: Promise<any>,
		doneResolve?: Function,
		doneReject?: Function,
		template?: string,
	) {
		if (this.donePromise) {
			let newDoneReject, newDoneResolve;

			const newDonePromise = new Promise((resolve, reject) => {
				newDoneResolve = resolve;
				newDoneReject = reject;
			});

			this.promptQueue.push({
				buttons,
				title,
				savePromise,
				donePromise: newDonePromise,
				doneResolve: newDoneResolve,
				doneReject: newDoneReject,
				template,
			});

			return await newDonePromise;
		}

		this.editButtons = buttons;
		this.title = title;
		this.template = template;
		this.savePromise = savePromise;

		if (donePromise) {
			this.donePromise = donePromise;
			this.doneResolve = doneResolve;
			this.doneReject = doneReject;
		} else {
			this.donePromise = new Promise((resolve, reject) => {
				this.doneResolve = resolve;
				this.doneReject = reject;
			});
		}

		setTimeout(() => {
			this.isVisible = true;
		});

		return await this.donePromise;
	}

	clickButton(button: PromptButton, event: Event) {
		this.doneResolve(button.value || button.buttonName);
		event.stopPropagation();
		if (this.savePromise) {
			this.waiting = true;
			this.savePromise
				.then(() => {
					this.waiting = false;
					this.hide(event);
				})
				.catch(() => {
					this.waiting = false;
				});
		} else {
			this.hide(event);
		}
		return false;
	}

	reset() {
		this.editForm = null;
		this.editButtons = null;
		this.title = null;
		this.fields = null;
		this.donePromise = null;
		this.doneResolve = null;
		this.doneReject = null;
		this.template = null;
		this.waiting = false;

		if (this.promptQueue.length) {
			const next = this.promptQueue.shift();
			if (next.fields) {
				this.prompt(
					next.form,
					next.fields,
					next.title,
					next.savePromise,
					next.saveText,
					next.cancelText,
					next.donePromise,
					next.doneResolve,
					next.doneReject,
					next.template,
				);
			} else if (next.buttons) {
				this.promptButtons(
					next.buttons,
					next.title,
					next.savePromise,
					next.donePromise,
					next.doneResolve,
					next.doneReject,
					next.template,
				);
			}
		}
	}
}
