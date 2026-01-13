import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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

describe('ManageTagsComponent #manage-tags (ng-mocks)', () => {
	// Per-test mutable state
	let state: {
		throwError: boolean;
		confirmResult: boolean;
		deleted: boolean;
		deletedTag: TagVO | null;
		renamed: boolean;
		renamedTag: TagVO | null;
		tags: TagVO[];
	};

	let mockApiService: any;
	let mockPromptService: any;

	function initState(initialTags?: TagVO[]) {
		state = {
			throwError: false,
			confirmResult: true,
			deleted: false,
			deletedTag: null,
			renamed: false,
			renamedTag: null,
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

		mockApiService = {
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

		mockPromptService = {
			async confirm(): Promise<boolean> {
				return state.confirmResult
					? await Promise.resolve(true)
					: await Promise.reject();
			},
		};
	}

	async function setupMockBuilder() {
		await MockBuilder(ManageTagsComponent, DummyModule)
			.provide({
				provide: ApiService,
				useValue: mockApiService,
			})
			.provide({
				provide: PromptService,
				useValue: mockPromptService,
			});
	}

	function render(tags = state.tags) {
		return MockRender(`<pr-manage-tags [tags]="tags"></pr-manage-tags>`, {
			tags,
		});
	}

	it('should exist', async () => {
		initState();
		await setupMockBuilder();
		const fixture = render();

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should have a sorted list of tags', async () => {
		initState();
		await setupMockBuilder();
		render();

		expect(ngMocks.findAll('.tag').length).toBe(2);
		expect(ngMocks.findAll('.tag')[0].nativeElement.textContent).toContain(
			'Potato',
		);
	});

	it('should have a delete button for each keyword', async () => {
		initState();
		await setupMockBuilder();
		render();
		const instance = ngMocks.findInstance(ManageTagsComponent);

		expect(ngMocks.findAll('.delete').length).toBeGreaterThan(0);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');

		expect(refreshTagsSpy).not.toHaveBeenCalled();
	});

	it('should be able to delete a keyword', async () => {
		initState();
		await setupMockBuilder();
		const fixture = render();
		const instance = ngMocks.findInstance(ManageTagsComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');

		ngMocks.findAll('.delete')[0].nativeElement.click();
		await fixture.whenStable();
		fixture.detectChanges();

		expect(state.deleted).toBeTrue();
		expect(state.deletedTag!.name).toBe('Potato');
		expect(refreshTagsSpy).toHaveBeenCalled();
		expect(ngMocks.findAll('.tag').length).toBe(1);
	});

	it('should not delete a keyword if an error happens', async () => {
		initState();
		await setupMockBuilder();
		render();
		const instance = ngMocks.findInstance(ManageTagsComponent);
		state.throwError = true;

		try {
			await instance.deleteTag(state.tags[0]);
			fail('expected deleteTag to throw');
		} catch {
			// expected
		} finally {
			expect(instance.getFilteredTags().length).toBe(2);
		}
	});

	it('should have edit buttons for each keyword', async () => {
		initState();
		await setupMockBuilder();
		render();

		expect(ngMocks.findAll('.edit').length).toBeGreaterThan(0);
	});

	it('should be able to enter edit mode for a keyword', async () => {
		initState();
		await setupMockBuilder();
		const fixture = render();

		ngMocks.findAll('.edit')[0].nativeElement.click();
		fixture.detectChanges();

		expect(ngMocks.findAll('.tag input').length).toBe(1);
		expect(ngMocks.find('.tag input').nativeElement.value).toBe('Potato');
	});

	it('should be able to rename tags', async () => {
		initState();
		await setupMockBuilder();
		const fixture = render();
		const instance = ngMocks.findInstance(ManageTagsComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');

		ngMocks.findAll('.edit')[0].nativeElement.click();
		fixture.detectChanges();

		const input = ngMocks.find('.tag input').nativeElement;
		input.focus();
		input.value = 'Starchy Tuber';
		input.dispatchEvent(new Event('change'));
		input.form.dispatchEvent(new Event('submit'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(ngMocks.findAll('.tag input').length).toBe(0);
		expect(state.renamed).toBeTrue();
		expect(state.renamedTag!.name).toBe('Starchy Tuber');
		expect(refreshTagsSpy).toHaveBeenCalled();
	});

	it('can cancel out of renaming a keyword', async () => {
		initState();
		await setupMockBuilder();
		const fixture = render();

		ngMocks.findAll('.edit')[0].nativeElement.click();
		fixture.detectChanges();

		const input = ngMocks.find('.tag input').nativeElement;
		input.value = 'Do Not Show Value';
		input.dispatchEvent(new Event('change'));
		ngMocks.find('.cancel').nativeElement.click();
		fixture.detectChanges();

		expect(ngMocks.findAll('.cancel').length).toBe(0);
		expect(ngMocks.findAll('.tag')[0].nativeElement.textContent).not.toContain(
			'Do Not Show Value',
		);
	});

	it('should have a null state', async () => {
		initState([]);
		await setupMockBuilder();
		render([]);

		expect(ngMocks.findAll('.tag').length).toBe(0);
		expect(ngMocks.findAll('.tagList').length).toBe(0);
	});

	describe('Keywords filtering', () => {
		async function testValue(val: string, expectedCount: number) {
			initState();
			await setupMockBuilder();
			const fixture = render();
			const input = ngMocks.find('input.filter').nativeElement;

			input.value = val;
			input.dispatchEvent(new Event('change'));
			fixture.detectChanges();

			expect(ngMocks.findAll('.tag').length).toBe(expectedCount);
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
			initState();
			state.confirmResult = clickConfirm;
			await setupMockBuilder();
			const fixture = render();

			ngMocks.findAll('.delete')[0].nativeElement.click();
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
