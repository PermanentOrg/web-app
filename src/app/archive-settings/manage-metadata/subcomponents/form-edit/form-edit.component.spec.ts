import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { A11yModule } from '@angular/cdk/a11y';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { MetadataValuePipe } from '../../pipes/metadata-value.pipe';
import { FormEditComponent } from './form-edit.component';

describe('FormEditComponent', () => {
	let deleted = false;
	let updated = false;
	let newTagName: string;
	let callbackCalls: number;
	let subject: Subject<number>;

	beforeEach(async () => {
		deleted = false;
		updated = false;
		newTagName = null;
		callbackCalls = 0;
		subject = new Subject<number>();
		await MockBuilder(FormEditComponent, ManageMetadataModule)
			.keep(A11yModule)
			.keep(FormsModule)
			.keep(MetadataValuePipe);
	});

	function defaultRender(name: string = 'test') {
		return MockRender(
			'<pr-metadata-form-edit [displayName]="name" [delete]="delete" [save]="save" [closeWindowEvent]="subject"></pr-metadata-form-edit>',
			{
				name,
				delete: async () => {
					callbackCalls += 1;
					deleted = true;
				},
				save: async (n: string) => {
					callbackCalls += 1;
					updated = true;
					newTagName = n;
				},
				subject,
			},
		);
	}

	it('should exist', () => {
		const fixture = MockRender(FormEditComponent);

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should print tag value', () => {
		defaultRender();

		expect(ngMocks.find('.value-name').nativeElement.innerText).toBe('test');
	});

	it('should have a dropdown edit/delete menu', () => {
		const fixture = defaultRender();

		expect(ngMocks.findAll('.edit-delete-menu').length).toBe(0);
		expect(ngMocks.findAll('.edit-delete-trigger').length).toBe(1);
		ngMocks.findAll('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.edit-delete-menu').length).toBe(1);
	});

	it('should be call the delete function', async () => {
		const fixture = defaultRender();

		expect(ngMocks.findAll('.delete').length).toBe(0);
		ngMocks.findAll('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.delete').length).toBe(1);
		ngMocks.findAll('.delete')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		await fixture.whenStable();

		expect(deleted).toBeTrue();
	});

	it('should be able to open the value editor', () => {
		const fixture = defaultRender('123');
		const instance = ngMocks.findInstance(FormEditComponent);

		expect(ngMocks.findAll('.value-editor').length).toBe(0);
		expect(ngMocks.findAll('.edit').length).toBe(0);
		ngMocks.findAll('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.edit').length).toBe(1);
		ngMocks.findAll('.edit')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.value-line').length).toBe(0);
		expect(ngMocks.findAll('.edit-delete-menu').length).toBe(0);
		expect(ngMocks.findAll('.value-editor').length).toBe(1);
		expect(ngMocks.findAll('.value-editor input').length).toBe(1);
		const input = ngMocks.find('.value-editor input');
		input.nativeElement.value = 'Test';
		input.triggerEventHandler('input', { target: input.nativeElement });

		expect(instance.newValueName).toBe('Test');
		expect(input.nativeElement.placeholder).toBe('123');
	});

	it('should be able to edit a value', async () => {
		const fixture = defaultRender('testValue');
		const instance = ngMocks.findInstance(FormEditComponent);

		ngMocks.findAll('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		ngMocks.findAll('.edit')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		const input = ngMocks.find('.value-editor input');

		expect(instance.newValueName).toBe('testValue');
		input.nativeElement.value = 'potato';
		input.triggerEventHandler('input', { target: input.nativeElement });
		ngMocks.find('form').triggerEventHandler('submit', {});
		await fixture.whenStable();
		fixture.detectChanges();

		expect(ngMocks.findAll('.value-editor').length).toBe(0);
		expect(updated).toBeTrue();
		expect(newTagName).toBe('potato');
		expect(instance.newValueName).toBe('potato');
	});

	it('should not send multiple delete calls', async () => {
		const fixture = defaultRender();

		ngMocks.findAll('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		ngMocks.findAll('.delete')[0].triggerEventHandler('click', {});
		ngMocks.findAll('.delete')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		await fixture.whenStable();

		expect(callbackCalls).toBe(1);
	});

	it('should not send multiple save calls', async () => {
		const fixture = defaultRender();

		ngMocks.findAll('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		ngMocks.findAll('.edit')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		const input = ngMocks.find('.value-editor input');
		input.nativeElement.value = 'potato';
		input.triggerEventHandler('input', { target: input.nativeElement });
		ngMocks.find('form').triggerEventHandler('submit', {});
		ngMocks.find('form').triggerEventHandler('submit', {});
		await fixture.whenStable();
		fixture.detectChanges();

		expect(callbackCalls).toBe(1);
	});

	it('should be able to subscribe to an event that closes the edit dialog', () => {
		const fixture = defaultRender();

		ngMocks.findAll('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		subject.next(Infinity);
		fixture.detectChanges();

		expect(ngMocks.findAll('.edit-delete-menu').length).toBe(0);
	});

	it('should emit an event that closes other edit dialogs when another is opened', () => {
		let emitted = false;
		subject.subscribe(() => {
			emitted = true;
		});
		defaultRender();

		ngMocks.findAll('.edit-delete-trigger')[0].triggerEventHandler('click', {});

		expect(emitted).toBeTrue();
	});

	it('should open the editor directly if double clicked', () => {
		const fixture = defaultRender();

		ngMocks.find('.value-line').triggerEventHandler('dblclick', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.value-editor input').length).toBe(1);
	});
});
