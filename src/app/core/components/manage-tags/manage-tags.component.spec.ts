import { NgModule } from '@angular/core';
import { Shallow } from 'shallow-render';

import { TagVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { ManageTagsComponent } from './manage-tags.component';

@NgModule({
	declarations: [], // components your module owns.
	imports: [], // other modules your module needs.
	providers: [ApiService], // providers available to your module.
	bootstrap: [], // bootstrap this root component.
})
class DummyModule {}

let throwError: boolean = false;
let deleted: boolean = false;
let deletedTag: TagVO;
let renamed: boolean = false;
let renamedTag: TagVO;
const mockApiService = {
	tag: {
		delete: async (data: any) => {
			if (throwError) {
				throw 'Test Error';
			}
			deleted = true;
			deletedTag = data as TagVO;
			return {
				getTagVOData: () => {
					return data;
				},
			};
		},
		update: async (data: any) => {
			if (throwError) {
				throw 'Test Error';
			}
			renamed = true;
			renamedTag = data as TagVO;
			return {
				getTagVOData: () => {
					return data;
				},
			};
		},
	},
};
let confirm: boolean = true;
const mockPromptService = {
	async confirm(): Promise<boolean> {
		if (confirm) {
			return Promise.resolve(true);
		} else {
			return Promise.reject();
		}
	},
};

describe('ManageTagsComponent #manage-tags', () => {
	let shallow: Shallow<ManageTagsComponent>;
	let defaultTags: TagVO[] = [];
	async function defaultRender(tags: TagVO[] = defaultTags) {
		return await shallow.render(
			`<pr-manage-tags [tags]="tags"></pr-manage-tags>`,
			{
				bind: {
					tags,
				},
			},
		);
	}
	beforeEach(() => {
		throwError = false;
		deleted = false;
		renamed = false;
		deletedTag = null;
		renamedTag = null;
		confirm = true;
		defaultTags = [
			new TagVO({
				name: 'Tomato',
				tagId: 2,
			}),
			new TagVO({
				name: 'Potato',
				tagId: 1,
			}),
			new TagVO({
				name: 'vegetable:potato',
				tagId: 3,
				type: 'type.tag.metadata.customField',
			}),
		];
		shallow = new Shallow(ManageTagsComponent, DummyModule)
			.mock(ApiService, mockApiService)
			.mock(PromptService, mockPromptService);
	});

	it('should exist', async () => {
		const { element } = await shallow.render();

		expect(element).not.toBeNull();
	});

	it('should have a sorted list of tags', async () => {
		const { find, element } = await defaultRender();

		expect(find('.tag').length).toBe(2);
		expect(find('.tag')[0].nativeElement.textContent).toContain('Potato');
	});

	it('should have a delete button for each keyword', async () => {
		const { find, outputs } = await defaultRender();

		expect(find('.delete').length).toBeGreaterThan(0);
		expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
	});

	it('should be able to delete a keyword', async () => {
		const { find, fixture, outputs } = await defaultRender();
		find('.delete')[0].nativeElement.click();
		await fixture.whenStable();
		await fixture.detectChanges();

		expect(deleted).toBeTruthy();
		expect(deletedTag.name).toBe('Potato');
		expect(outputs.refreshTags.emit).toHaveBeenCalled();
		expect(find('.tag').length).toBe(1);
	});

	it('should not delete a keyword if an error happens', async () => {
		const { element } = await defaultRender();
		throwError = true;
		try {
			await element.componentInstance.deleteTag(defaultTags[0]);
		} catch {
			// Catch error!
		} finally {
			expect(element.componentInstance.getFilteredTags().length).toBe(2);
		}
	});

	it('should have edit buttons for each keyword', async () => {
		const { find } = await defaultRender();

		expect(find('.edit').length).toBeGreaterThan(0);
	});

	it('should be able to enter edit mode for a keyword', async () => {
		const { find, fixture } = await defaultRender();
		find('.edit')[0].nativeElement.click();
		await fixture.detectChanges();

		expect(find('.tag input').length).toBe(1);
		expect(find('.tag input').nativeElement.value).toBe('Potato');
	});

	it('should be able to rename tags', async () => {
		const { find, fixture, outputs } = await defaultRender();
		find('.edit')[0].nativeElement.click();
		await fixture.detectChanges();
		find('.tag input').nativeElement.focus();
		find('.tag input').nativeElement.value = 'Starchy Tuber';
		find('.tag input').nativeElement.dispatchEvent(new Event('change'));
		find('.tag input').nativeElement.form.dispatchEvent(new Event('submit'));
		await fixture.whenStable();
		await fixture.detectChanges();

		expect(find('.tag input').length).toBe(0);
		expect(renamed).toBeTruthy();
		expect(renamedTag.name).toBe('Starchy Tuber');
		expect(outputs.refreshTags.emit).toHaveBeenCalled();
	});

	it('can cancel out of renaming a keyword', async () => {
		const { find, fixture } = await defaultRender();
		find('.edit')[0].nativeElement.click();
		await fixture.detectChanges();
		find('.tag input').nativeElement.value = 'Do Not Show Value';
		find('.tag input').nativeElement.dispatchEvent(new Event('change'));
		find('.cancel').nativeElement.click();
		await fixture.detectChanges();

		expect(find('.cancel').length).toBe(0);
		expect(find('.tag')[0].nativeElement.textContent).not.toContain(
			'Do Not Show Value',
		);
	});

	it('should have a null state', async () => {
		const { find } = await defaultRender([]);

		expect(find('.tag').length).toBe(0);
		expect(find('.tagList').length).toBe(0);
	});

	describe('Keywords filtering', () => {
		async function testValue(val: string, expectedCount: number) {
			const { find, fixture } = await defaultRender();
			find('input.filter').nativeElement.value = val;
			find('input.filter').nativeElement.dispatchEvent(new Event('change'));
			await fixture.detectChanges();

			expect(find('.tag').length).toBe(expectedCount);
		}
		it('Trimming input', async () => {
			testValue('  p ', 1);
		});

		it('Case-insensitivity', async () => {
			testValue('tOm', 1);
		});

		it('Searches anywhere in word', async () => {
			testValue('To', 2);
		});

		it('Completely invalid match', async () => {
			testValue('zzz', 0);
		});

		it('Null case', async () => {
			testValue('', 2);
		});
	});

	describe('Prompting for deletion', () => {
		async function testConfirm(clickConfirm: boolean) {
			const { find, fixture } = await defaultRender();
			confirm = clickConfirm;
			find('.delete')[0].nativeElement.click();
			await fixture.whenStable();

			expect(deleted).toBe(clickConfirm);
		}
		it('should not delete when you cancel out', async () => {
			testConfirm(false);
		});

		it('should delete when you click confirm', async () => {
			testConfirm(true);
		});
	});
});
