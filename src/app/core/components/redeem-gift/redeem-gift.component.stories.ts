/* @format */
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { PrConstantsPipe } from '@shared/pipes/pr-constants.pipe';
import { RedeemGiftComponent } from './redeem-gift.component';
import { MockAccountService, MockBillingRepo } from './shared-mocks';

const meta: Meta<RedeemGiftComponent> = {
	title: 'Redeem Gift Form',
	component: RedeemGiftComponent,
	tags: ['storage-dialog', 'dialog'],
	decorators: [
		moduleMetadata({
			imports: [FormsModule, ReactiveFormsModule],
			declarations: [PrConstantsPipe],
			providers: [
				{ provide: AccountService, useClass: MockAccountService },
				{ provide: ApiService, useValue: { billing: new MockBillingRepo() } },
			],
		}),
	],
};
export default meta;

type Story = StoryObj<RedeemGiftComponent>;

export const Successful: Story = {};
export const ForceError: Story = (() => {
	const billing = new MockBillingRepo();
	billing.isSuccessful = false;
	return {
		decorators: [
			moduleMetadata({
				providers: [{ provide: ApiService, useValue: { billing } }],
			}),
		],
	};
})();
