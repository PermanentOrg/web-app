import { NgModule } from '@angular/core';
import { Shallow } from 'shallow-render';

import { TagVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { ManageTagsComponent } from './manage-tags.component';

// Keep DummyModule "empty" to avoid extra mocking surfaces.
@NgModule({
	declarations: [],
	imports: [],
	providers: [],
})
class DummyModule {}

/**
 * Build fresh Shallow + mock state for each test.
 * Nothing persists across tests.
 */
function buildHarness(initialTags?: TagVO[]) {
	// Per-test mutable state lives in this closure:
	const state = {
		throwError: false,
		confirmResult: true,
		deleted: false as boolean,
		deletedTag: null as TagVO | null,
		renamed: false as boolean,
		renamedTag: null as TagVO | null,
		tags: initialTags ?? [
			new TagVO({ name: 'Tomato', tagId: 2 }),
			new TagVO({ name: 'Potato', tagId: 1 }),
			new TagVO({
				name: 'vegetable:potato',
				tagId: 3,
				type: 'type.tag.metadata.customField',
			}),
		],
	};

	const mockApiService = {
		tag: {
			delete: async (data: any) => {
				if (state.throwError) throw 'Test Error';
				state.deleted = true;
				state.deletedTag = data as TagVO;
				return { getTagVOData: () => data };
			},
			update: async (data: any) => {
				if (state.throwError) throw 'Test Error';
				state.renamed = true;
				state.renamedTag = data as TagVO;
				return { getTagVOData: () => data };
			},
		},
	};

	const mockPromptService = {
		async confirm(): Promise<boolean> {
			return state.confirmResult
				? await Promise.resolve(true)
				: await Promise.reject();
		},
	};

	const shallow = new Shallow(ManageTagsComponent, DummyModule)
		.mock(ApiService, mockApiService)
		.mock(PromptService, mockPromptService);

	/**
	 * Convenience renderers that bind tags
	 */
	async function render(tags = state.tags) {
		return await shallow.render(
			`<pr-manage-tags [tags]="tags"></pr-manage-tags>`,
			{
				bind: { tags },
			},
		);
	}

	return { state, render };
}

describe('ManageTagsComponent #manage-tags (shallow-safe)', () => {
	it('should exist', async () => {
		const { render } = buildHarness();
		const { element } = await render();

		expect(element).not.toBeNull();
	});

	it('should have a sorted list of tags', async () => {
		const { render } = buildHarness();
		const { find } = await render();

		expect(find('.tag').length).toBe(2);
		expect(find('.tag')[0].nativeElement.textContent).toContain('Potato');
	});

	it('should have a delete button for each keyword', async () => {
		const { render } = buildHarness();
		const { find, outputs } = await render();

		expect(find('.delete').length).toBeGreaterThan(0);
		expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
	});

	it('should be able to delete a keyword', async () => {
		const { state, render } = buildHarness();
		const { find, fixture, outputs } = await render();

		find('.delete')[0].nativeElement.click();
		await fixture.whenStable();
		fixture.detectChanges();

		expect(state.deleted).toBeTrue();
		expect(state.deletedTag!.name).toBe('Potato');
		expect(outputs.refreshTags.emit).toHaveBeenCalled();
		expect(find('.tag').length).toBe(1);
	});

	it('should not delete a keyword if an error happens', async () => {
		const { state, render } = buildHarness();
		const { element } = await render();
		state.throwError = true;

		try {
			await element.componentInstance.deleteTag(state.tags[0]);
			fail('expected deleteTag to throw');
		} catch {
			// expected
		} finally {
			expect(element.componentInstance.getFilteredTags().length).toBe(2);
		}
	});

	it('should have edit buttons for each keyword', async () => {
		const { render } = buildHarness();
		const { find } = await render();

		expect(find('.edit').length).toBeGreaterThan(0);
	});

	it('should be able to enter edit mode for a keyword', async () => {
		const { render } = buildHarness();
		const { find, fixture } = await render();

		find('.edit')[0].nativeElement.click();
		fixture.detectChanges();

		expect(find('.tag input').length).toBe(1);
		expect(find('.tag input').nativeElement.value).toBe('Potato');
	});

	it('should be able to rename tags', async () => {
		const { state, render } = buildHarness();
		const { find, fixture, outputs } = await render();

		find('.edit')[0].nativeElement.click();
		fixture.detectChanges();

		const input = find('.tag input').nativeElement;
		input.focus();
		input.value = 'Starchy Tuber';
		input.dispatchEvent(new Event('change'));
		input.form.dispatchEvent(new Event('submit'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(find('.tag input').length).toBe(0);
		expect(state.renamed).toBeTrue();
		expect(state.renamedTag!.name).toBe('Starchy Tuber');
		expect(outputs.refreshTags.emit).toHaveBeenCalled();
	});

	it('can cancel out of renaming a keyword', async () => {
		const { render } = buildHarness();
		const { find, fixture } = await render();

		find('.edit')[0].nativeElement.click();
		fixture.detectChanges();

		const input = find('.tag input').nativeElement;
		input.value = 'Do Not Show Value';
		input.dispatchEvent(new Event('change'));
		find('.cancel').nativeElement.click();
		fixture.detectChanges();

		expect(find('.cancel').length).toBe(0);
		expect(find('.tag')[0].nativeElement.textContent).not.toContain(
			'Do Not Show Value',
		);
	});

	it('should have a null state', async () => {
		const { render } = buildHarness([]);
		const { find } = await render([]);

		expect(find('.tag').length).toBe(0);
		expect(find('.tagList').length).toBe(0);
	});

	describe('Keywords filtering', () => {
		async function testValue(val: string, expectedCount: number) {
			const { render } = buildHarness();
			const { find, fixture } = await render();
			const input = find('input.filter').nativeElement;

			input.value = val;
			input.dispatchEvent(new Event('change'));
			fixture.detectChanges();

			expect(find('.tag').length).toBe(expectedCount);
		}

		it('Trimming input', async () => {
			await testValue('  p ', 1);
		});

		it('Case-insensitivity', async () => {
			await testValue('tOm', 1);
		});

		it('Searches anywhere in word', async () => {
			await testValue('To', 2);
		});

		it('Completely invalid match', async () => {
			await testValue('zzz', 0);
		});

		it('Null case', async () => {
			await testValue('', 2);
		});
	});

	describe('Prompting for deletion', () => {
		async function testConfirm(clickConfirm: boolean) {
			const { state, render } = buildHarness();
			const { find, fixture } = await render();

			state.confirmResult = clickConfirm;
			find('.delete')[0].nativeElement.click();
			await fixture.whenStable();

			expect(state.deleted).toBe(clickConfirm);
		}

		it('should not delete when you cancel out', async () => {
			await testConfirm(false);
		});

		it('should delete when you click confirm', async () => {
			await testConfirm(true);
		});
	});
});
