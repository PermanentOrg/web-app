import { Shallow } from 'shallow-render';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { A11yModule } from '@angular/cdk/a11y';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { MetadataValuePipe } from '../../pipes/metadata-value.pipe';
import { FormEditComponent } from './form-edit.component';

describe('FormEditComponent', () => {
	let shallow: Shallow<FormEditComponent>;
	let deleted = false;
	let updated = false;
	let newTagName: string;
	let callbackCalls: number;
	let subject: Subject<number>;

	const defaultRender = async (name: string = 'test') =>
		await shallow.render(
			'<pr-metadata-form-edit [displayName]="name" [delete]="delete" [save]="save" [closeWindowEvent]="subject"></pr-metadata-form-edit>',
			{
				bind: {
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
			},
		);

	beforeEach(() => {
		deleted = false;
		updated = false;
		newTagName = null;
		callbackCalls = 0;
		subject = new Subject<number>();
		shallow = new Shallow(FormEditComponent, ManageMetadataModule)
			.dontMock(A11yModule)
			.import(FormsModule)
			.dontMock(MetadataValuePipe);
	});

	it('should exist', async () => {
		const { element } = await shallow.render();

		expect(element).not.toBeNull();
	});

	it('should print tag value', async () => {
		const { find } = await defaultRender();

		expect(find('.value-name').nativeElement.innerText).toBe('test');
	});

	it('should have a dropdown edit/delete menu', async () => {
		const { find, fixture } = await defaultRender();

		expect(find('.edit-delete-menu').length).toBe(0);
		expect(find('.edit-delete-trigger').length).toBe(1);
		find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(find('.edit-delete-menu').length).toBe(1);
	});

	it('should be call the delete function', async () => {
		const { find, fixture } = await defaultRender();

		expect(find('.delete').length).toBe(0);
		find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(find('.delete').length).toBe(1);
		find('.delete')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		await fixture.whenStable();

		expect(deleted).toBeTrue();
	});

	it('should be able to open the value editor', async () => {
		const { instance, find, fixture } = await defaultRender('123');

		expect(find('.value-editor').length).toBe(0);
		expect(find('.edit').length).toBe(0);
		find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(find('.edit').length).toBe(1);
		find('.edit')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(find('.value-line').length).toBe(0);
		expect(find('.edit-delete-menu').length).toBe(0);
		expect(find('.value-editor').length).toBe(1);
		expect(find('.value-editor input').length).toBe(1);
		const input = find('.value-editor input');
		input.nativeElement.value = 'Test';
		input.triggerEventHandler('input', { target: input.nativeElement });

		expect(instance.newValueName).toBe('Test');
		expect(input.nativeElement.placeholder).toBe('123');
	});

	it('should be able to edit a value', async () => {
		const { find, fixture, instance } = await defaultRender('testValue');
		find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		find('.edit')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		const input = find('.value-editor input');

		expect(instance.newValueName).toBe('testValue');
		input.nativeElement.value = 'potato';
		input.triggerEventHandler('input', { target: input.nativeElement });
		find('form').triggerEventHandler('submit', {});
		await fixture.whenStable();
		fixture.detectChanges();

		expect(find('.value-editor').length).toBe(0);
		expect(updated).toBeTrue();
		expect(newTagName).toBe('potato');
		expect(instance.newValueName).toBe('potato');
	});

	it('should not send multiple delete calls', async () => {
		const { find, fixture } = await defaultRender();
		find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		find('.delete')[0].triggerEventHandler('click', {});
		find('.delete')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		await fixture.whenStable();

		expect(callbackCalls).toBe(1);
	});

	it('should not send multiple save calls', async () => {
		const { find, fixture } = await defaultRender();
		find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		find('.edit')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		const input = find('.value-editor input');
		input.nativeElement.value = 'potato';
		input.triggerEventHandler('input', { target: input.nativeElement });
		find('form').triggerEventHandler('submit', {});
		find('form').triggerEventHandler('submit', {});
		await fixture.whenStable();
		fixture.detectChanges();

		expect(callbackCalls).toBe(1);
	});

	it('should be able to subscribe to an event that closes the edit dialog', async () => {
		const { find, fixture } = await defaultRender();
		find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		subject.next(Infinity);
		fixture.detectChanges();

		expect(find('.edit-delete-menu').length).toBe(0);
	});

	it('should emit an event that closes other edit dialogs when another is opened', async () => {
		let emitted = false;
		subject.subscribe(() => {
			emitted = true;
		});
		const { find } = await defaultRender();
		find('.edit-delete-trigger')[0].triggerEventHandler('click', {});

		expect(emitted).toBeTrue();
	});

	it('should open the editor directly if double clicked', async () => {
		const { find, fixture } = await defaultRender();
		find('.value-line').triggerEventHandler('dblclick', {});
		fixture.detectChanges();

		expect(find('.value-editor input').length).toBe(1);
	});
});
