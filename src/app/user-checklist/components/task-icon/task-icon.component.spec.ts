import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { UserChecklistModule } from '../../user-checklist.module';
import { TaskIconComponent } from './task-icon.component';

describe('TaskIconComponent', () => {
	beforeEach(async () => {
		await MockBuilder(TaskIconComponent, UserChecklistModule);
	});

	it('does nothing with no icon input', () => {
		MockRender(TaskIconComponent);

		expect(ngMocks.findAll('.completed').length).toBe(0);
		expect(ngMocks.findAll('svg').length).toBe(0);
	});

	it('can handle undefined icons', () => {
		MockRender(TaskIconComponent, { icon: 'undefinedIconForUnitTest' });

		expect(ngMocks.findAll('svg').length).toBe(0);
	});

	it('should mark the element as completed if specified in the input', () => {
		MockRender(TaskIconComponent, { completed: true });

		expect(ngMocks.findAll('.completed').length).toBe(1);
	});

	describe('defined icons', () => {
		function expectIconToHaveDefinedSvg(icon: string) {
			MockRender(TaskIconComponent, { icon });

			expect(ngMocks.findAll('svg').length).toBe(1);
		}

		const icons = [
			'archiveCreated',
			'storageRedeemed',
			'legacyContact',
			'archiveSteward',
			'archiveProfile',
			'firstUpload',
			'publishContent',
		];
		icons.forEach((icon) => {
			it(`has an icon for the "${icon}" item`, () => {
				expectIconToHaveDefinedSvg(icon);
			});
		});
	});
});
