import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { FormCreateComponent } from './form-create.component';

describe('FormCreateComponent', () => {
	beforeEach(
		async () =>
			await MockBuilder(FormCreateComponent, ManageMetadataModule)
				.keep(FormsModule)
				.keep(A11yModule),
	);

	function defaultRender(
		c: (tagName: string) => Promise<void> = async () => {},
	) {
		return MockRender(
			'<pr-metadata-creation-form placeholder="Add New Test" [submitCallback]="callback"></pr-metadata-creation-form>',
			{ callback: c },
		);
	}

	it('should create', () => {
		const fixture = defaultRender();

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should be a text label at first', () => {
		defaultRender();

		expect(ngMocks.findAll('.placeholder-text').length).toBe(1);
		expect(ngMocks.findAll('input').length).toBe(0);
	});

	it('should open up to a textbox', () => {
		const fixture = defaultRender();

		ngMocks.find('.placeholder-text').triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('input').length).toBe(1);
	});

	it('should use specified placeholder text', () => {
		const fixture = defaultRender();

		expect(ngMocks.find('.placeholder-text').nativeElement.innerText).toBe(
			'Add New Test',
		);
		ngMocks.find('.placeholder-text').triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.find('input').nativeElement.placeholder).toBe(
			'Add New Test',
		);
	});

	it('should take in a callback and execute it', async () => {
		let createdTag = '';
		const fixture = defaultRender(async (tagName) => {
			createdTag = tagName;
		});
		const instance = ngMocks.findInstance(FormCreateComponent);

		ngMocks.find('.placeholder-text').triggerEventHandler('click', {});
		fixture.detectChanges();
		const input = ngMocks.find('input');
		input.nativeElement.value = 'abc';
		input.triggerEventHandler('input', { target: input.nativeElement });
		fixture.detectChanges();
		ngMocks.find('form').triggerEventHandler('submit', {
			target: ngMocks.find('form').nativeElement,
		});

		expect(instance.waiting).toBe(true);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(createdTag).toBe('abc');
		expect(instance.waiting).toBe(false);
		expect(ngMocks.findAll('.placeholder-text').length).toBe(1);
	});

	it('should not close editor if callback promise is rejected', async () => {
		const fixture = defaultRender(async (tagName) => {
			throw new Error();
		});
		const instance = ngMocks.findInstance(FormCreateComponent);

		ngMocks.find('.placeholder-text').triggerEventHandler('click', {});
		fixture.detectChanges();
		const input = ngMocks.find('input');
		input.nativeElement.value = 'abc';
		input.triggerEventHandler('input', { target: input.nativeElement });
		fixture.detectChanges();
		ngMocks.find('form').triggerEventHandler('submit', {
			target: ngMocks.find('form').nativeElement,
		});
		await fixture.whenStable();
		fixture.detectChanges();

		expect(ngMocks.findAll('input').length).toBe(1);
		await new Promise<void>((resolve) => {
			setTimeout(resolve, 1);
		});

		expect(instance.waiting).toBe(false);
	});

	it('should blank out the form after submitting', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(FormCreateComponent);

		instance.newTagName = 'potato';
		await instance.runSubmitCallback();

		expect(instance.newTagName).toBe('');
	});

	it('should not send multiple create requests', async () => {
		let callbackCalls = 0;
		const fixture = defaultRender(async () => {
			callbackCalls += 1;
		});

		ngMocks.find('.placeholder-text').triggerEventHandler('click', {});
		fixture.detectChanges();
		const input = ngMocks.find('input');
		input.nativeElement.value = 'abc';
		input.triggerEventHandler('input', { target: input.nativeElement });
		fixture.detectChanges();
		for (let i = 0; i < 3; i += 1) {
			ngMocks.find('form').triggerEventHandler('submit', {
				target: ngMocks.find('form').nativeElement,
			});
		}
		await fixture.whenStable();
		fixture.detectChanges();

		expect(callbackCalls).toBe(1);
	});
});
