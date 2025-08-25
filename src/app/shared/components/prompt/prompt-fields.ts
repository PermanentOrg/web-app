import { PromptField } from '@shared/services/prompt/prompt.service';
import { Validators } from '@angular/forms';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { clone } from 'lodash';
import { minDateValidator } from '@shared/utilities/forms';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { AccessRoleType } from '@models/access-role';
import { FormInputSelectOption } from '../form-input/form-input.component';

const prConstants: PrConstantsService = new PrConstantsService();

export const RELATION_OPTIONS = prConstants.getRelations().map((type) => {
	return {
		text: type.name,
		value: type.type,
	};
});

export const FOLDER_VIEW_OPTIONS: FormInputSelectOption[] = [
	{
		text: 'Timeline',
		value: FolderView.Timeline,
	},
	{
		text: 'Grid',
		value: FolderView.Grid,
	},
];

export const RELATIONSHIP_FIELD: PromptField = {
	fieldName: 'relationType',
	placeholder: 'Relationship',
	type: 'select',
	initialValue: null,
	validators: [Validators.required],
	config: {
		autocomplete: 'off',
		autocorrect: 'off',
		autocapitalize: 'off',
	},
	selectOptions: RELATION_OPTIONS,
};

export function RELATIONSHIP_FIELD_INITIAL(initialValue?: string): PromptField {
	const initialized = clone(RELATIONSHIP_FIELD);
	initialized.initialValue = initialValue;
	return initialized;
}

export const FOLDER_VIEW_FIELD: PromptField = {
	fieldName: 'view',
	placeholder: 'Folder view',
	type: 'select',
	initialValue: null,
	validators: [Validators.required],
	config: {
		autocapitalize: 'off',
		autocomplete: 'off',
		autocorrect: 'off',
	},
	selectOptions: FOLDER_VIEW_OPTIONS,
};

export function FOLDER_VIEW_FIELD_INIIAL(initialValue?: string): PromptField {
	const initialized = clone(FOLDER_VIEW_FIELD);
	initialized.initialValue = initialValue;
	return initialized;
}

export const ACCESS_ROLE_FIELD: PromptField = {
	fieldName: 'accessRole',
	placeholder: 'Access Level',
	type: 'select',
	initialValue: 'access.role.viewer',
	validators: [Validators.required],
	config: {
		autocomplete: 'off',
		autocorrect: 'off',
		autocapitalize: 'off',
	},
	selectOptions: prConstants.getAccessRoles().map((role) => {
		return {
			value: role.type as AccessRoleType,
			text: role.name,
		};
	}),
};

export function ACCESS_ROLE_FIELD_INITIAL(
	initialValue: AccessRoleType,
): PromptField {
	const initialized = clone(ACCESS_ROLE_FIELD);
	initialized.initialValue = initialValue;
	return initialized;
}

export const SHARE_ACCESS_ROLE_FIELD: PromptField = {
	fieldName: 'accessRole',
	placeholder: 'Access Level',
	type: 'select',
	initialValue: 'access.role.viewer',
	validators: [Validators.required],
	config: {
		autocomplete: 'off',
		autocorrect: 'off',
		autocapitalize: 'off',
	},
	selectOptions: prConstants.getShareAccessRoles().map((role) => {
		return {
			value: role.type as AccessRoleType,
			text: role.name,
		};
	}),
};

export function SHARE_ACCESS_ROLE_FIELD_INITIAL(
	initialValue: AccessRoleType,
): PromptField {
	const initialized = clone(SHARE_ACCESS_ROLE_FIELD);
	initialized.initialValue = initialValue;
	return initialized;
}

export function INVITATION_FIELDS(initialEmail?: string): PromptField[] {
	const fields: PromptField[] = [
		{
			fieldName: 'email',
			initialValue: initialEmail,
			validators: [Validators.required, Validators.email],
			placeholder: 'Recipient email',
			type: 'text',
			config: {
				autocapitalize: 'off',
				autocorrect: 'off',
				autocomplete: 'off',
				autoselect: false,
			},
		},
		{
			fieldName: 'name',
			validators: [Validators.required],
			placeholder: 'Recipient name',
			type: 'text',
			config: {
				autocapitalize: 'on',
				autocorrect: 'off',
				autocomplete: 'off',
			},
		},
		RELATIONSHIP_FIELD,
	];
	return fields;
}

const ON_OFF_FIELD_DEFAULT: PromptField = {
	fieldName: 'onOff',
	placeholder: 'Option on/off',
	config: {
		autocomplete: 'off',
		autocorrect: 'off',
		autocapitalize: 'off',
	},
	type: 'select',
	validators: [Validators.required],
	selectOptions: [
		{
			text: 'On',
			value: 'on',
		},
		{
			text: 'Off',
			value: 'off',
		},
	],
};

export function ON_OFF_FIELD(
	fieldName: string,
	placeholder: string,
	initialValue?: string | number,
) {
	const initial: PromptField = clone(ON_OFF_FIELD_DEFAULT);
	initial.fieldName = fieldName;
	initial.placeholder = placeholder;
	initial.initialValue = initialValue;
	return initial;
}

const NUMBER_FIELD_DEFAULT: PromptField = {
	fieldName: 'number',
	placeholder: 'Number',
	config: {
		autocomplete: 'off',
		autocorrect: 'off',
		autocapitalize: 'off',
	},
	type: 'number',
	validators: [Validators.required, Validators.min(0)],
};

export function NUMBER_FIELD(
	fieldName: string,
	placeholder: string,
	initialValue?: number,
	required = true,
) {
	const initial: PromptField = clone(NUMBER_FIELD_DEFAULT);
	initial.fieldName = fieldName;
	initial.placeholder = placeholder;
	initial.initialValue = initialValue;
	if (!required) {
		initial.validators = [];
	}
	return initial;
}

const DATE_FIELD_DEFAULT: PromptField = {
	fieldName: 'date',
	placeholder: 'Date',
	config: {
		autocomplete: 'off',
		autocorrect: 'off',
		autocapitalize: 'off',
	},
	type: 'date',
	validators: [],
};

export function DATE_FIELD(
	fieldName: string,
	placeholder: string,
	initialValue?: string | Date,
	minValue?: string | Date,
	required = false,
) {
	const initial: PromptField = clone(DATE_FIELD_DEFAULT);
	initial.fieldName = fieldName;
	initial.placeholder = placeholder;
	initial.initialValue = initialValue;
	if (required) {
		initial.validators = [Validators.required];
	}

	if (minValue) {
		initial.validators.push(minDateValidator(minValue));
	}

	return initial;
}

const READ_ONLY_FIELD_DEFAULT: PromptField = {
	fieldName: 'readOnly',
	placeholder: 'Read-Only',
	config: {
		autocomplete: 'off',
		autocorrect: 'off',
		autocapitalize: 'off',
		readOnly: true,
	},
	type: 'text',
	validators: [],
};

export function READ_ONLY_FIELD(
	fieldName: string,
	placeholder: string,
	initialValue?: string,
) {
	const initial: PromptField = clone(READ_ONLY_FIELD_DEFAULT);
	initial.fieldName = fieldName;
	initial.placeholder = placeholder;
	initial.initialValue = initialValue;
	return initial;
}
