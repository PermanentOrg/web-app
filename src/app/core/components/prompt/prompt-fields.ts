import { PromptField } from '@core/services/prompt/prompt.service';
import { Validators } from '@angular/forms';

const expMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const expYears = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

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
