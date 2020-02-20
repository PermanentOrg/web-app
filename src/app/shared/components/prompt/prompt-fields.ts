import { PromptField } from '@core/services/prompt/prompt.service';
import { Validators } from '@angular/forms';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { clone } from 'lodash';
import { minDateValidator } from '@shared/utilities/forms';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FormInputSelectOption } from '../form-input/form-input.component';
const expMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const expYears = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

const prConstants: PrConstantsService = new PrConstantsService();

export const RELATION_OPTIONS = prConstants.getRelations().map((type) => {
  return {
    text: type.name,
    value: type.type
  };
});

export const FOLDER_VIEW_OPTIONS: FormInputSelectOption[] = [
  {
    text: 'Timeline',
    value: FolderView.Timeline
  },
  {
    text: 'Grid',
    value: FolderView.Grid
  }
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
    autocapitalize: 'off'
  },
  selectOptions: RELATION_OPTIONS
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
    autocorrect: 'off'
  },
  selectOptions: FOLDER_VIEW_OPTIONS
};

export function FOLDER_VIEW_FIELD_INIIAL(initialValue?: string): PromptField {
  const initialized = clone(FOLDER_VIEW_FIELD);
  initialized.initialValue = initialValue;
  return initialized;
}

export const ACCESS_ROLE_FIELD: PromptField =  {
  fieldName: 'accessRole',
  placeholder: 'Access Level',
  type: 'select',
  initialValue: 'access.role.viewer',
  validators: [Validators.required],
  config: {
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off'
  },
  selectOptions: prConstants.getAccessRoles().map((role) => {
    return {
      value: role.type,
      text: role.name
    };
  })
};

export function ACCESS_ROLE_FIELD_INITIAL(initialValue: string): PromptField {
  const initialized = clone(ACCESS_ROLE_FIELD);
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
        autoselect: false
      }
    },
    {
      fieldName: 'name',
      validators: [Validators.required],
      placeholder: 'Recipient name',
      type: 'text',
      config: {
        autocapitalize: 'on',
        autocorrect: 'off',
        autocomplete: 'off'
      }
    },
    RELATIONSHIP_FIELD,
  ];
  return fields;
}

export const CREDIT_CARD_FIELDS: PromptField[] = [
  {
    fieldName: 'cardNumber',
    placeholder: 'Card number',
    type: 'tel',
    validators: [Validators.required],
    config: {
      autocomplete: 'cc-number',
      autocorrect: 'off',
      autocapitalize: 'off'
    }
  },
  {
    fieldName: 'cardCvc',
    placeholder: 'Security code',
    type: 'tel',
    validators: [Validators.required],
    config: {
      autocomplete: 'cc-csc',
      autocorrect: 'off',
      autocapitalize: 'off'
    }
  },
  {
    fieldName: 'cardExpMonth',
    placeholder: 'Expiration month',
    type: 'select',
    validators: [Validators.required],
    config: {
      autocomplete: 'cc-exp-month',
      autocorrect: 'off',
      autocapitalize: 'off'
    },
    selectOptions: expMonths.map((month) => {
      return {
        text: month,
        value: month
      };
    })
  },
  {
    fieldName: 'cardExpYear',
    placeholder: 'Expiration year',
    type: 'select',
    validators: [Validators.required],
    config: {
      autocomplete: 'cc-exp-yeah',
      autocorrect: 'off',
      autocapitalize: 'off'
    },
    selectOptions: expYears.map((year) => {
      return {
        text: year,
        value: year
      };
    })
  },
  {
    fieldName: 'cardNickname',
    placeholder: 'Card nickname',
    type: 'text',
    validators: [Validators.required],
    config: {
      autocomplete: 'off',
      autocorrect: 'off',
      autocapitalize: 'off'
    }
  },
];

export const ADDRESS_FIELDS: PromptField[] = [
  {
    fieldName: 'address',
    placeholder: 'Street address',
    type: 'text',
    validators: [Validators.required],
    config: {
      autocomplete: 'street-address address-line1',
      autocorrect: 'off',
      autocapitalize: 'off'
    }
  },
  {
    fieldName: 'address2',
    placeholder: 'Address line 2',
    type: 'text',
    config: {
      autocomplete: 'street-address address-line2',
      autocorrect: 'off',
      autocapitalize: 'off'
    }
  },
  {
    fieldName: 'city',
    placeholder: 'City',
    type: 'text',
    validators: [Validators.required],
    config: {
      autocomplete: 'address-level2',
      autocorrect: 'off',
      autocapitalize: 'off'
    }
  },
  {
    fieldName: 'state',
    placeholder: 'State',
    type: 'text',
    validators: [Validators.required],
    config: {
      autocomplete: 'address-level1',
      autocorrect: 'off',
      autocapitalize: 'off'
    }
  },
  {
    fieldName: 'zip',
    placeholder: 'Zip code',
    type: 'tel',
    validators: [Validators.required],
    config: {
      autocomplete: 'postal-code',
      autocorrect: 'off',
      autocapitalize: 'off'
    }
  },
];

const ON_OFF_FIELD_DEFAULT: PromptField = {
  fieldName: 'onOff',
  placeholder: 'Option on/off',
  config: {
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off'
  },
  type: 'select',
  validators: [Validators.required],
  selectOptions: [
    {
      text: 'On',
      value: 'on'
    },
    {
      text: 'Off',
      value: 'off'
    }
  ]
};

export function ON_OFF_FIELD(fieldName: string, placeholder: string, initialValue?: string | number) {
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
    autocapitalize: 'off'
  },
  type: 'number',
  validators: [Validators.required, Validators.min(0)]
};

export function NUMBER_FIELD(fieldName: string, placeholder: string, initialValue?: number, required = true) {
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
    autocapitalize: 'off'
  },
  type: 'date',
  validators: []
};

export function DATE_FIELD(
  fieldName: string,
  placeholder: string,
  initialValue?: string | Date,
  minValue?: string | Date,
  required = false
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
    readOnly: true
  },
  type: 'text',
  validators: []
};

export function READ_ONLY_FIELD(fieldName: string, placeholder: string, initialValue?: string) {
  const initial: PromptField = clone(READ_ONLY_FIELD_DEFAULT);
  initial.fieldName = fieldName;
  initial.placeholder = placeholder;
  initial.initialValue = initialValue;
  return initial;
}
