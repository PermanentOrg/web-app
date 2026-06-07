import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { ApiService } from '@shared/services/api/api.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { Directive } from '@models/directive';
import { DirectiveDialogComponent } from './directive-dialog.component';

const buildDirective = (
	directiveId: string,
	stewardEmail: string,
	note: string,
): Directive =>
	new Directive({
		directiveId,
		archiveId: 1,
		type: 'admin',
		createdDt: new Date(),
		updatedDt: new Date(),
		trigger: {
			directiveTriggerId: directiveId,
			directiveId,
			type: 'admin',
			createdDt: new Date(),
			updatedDt: new Date(),
		},
		steward: { email: stewardEmail, name: '' },
		note,
		executionDt: null,
	});

describe('DirectiveDialogComponent', () => {
	let component: DirectiveDialogComponent;
	let fixture: ComponentFixture<DirectiveDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DirectiveDialogComponent],
			imports: [],
			providers: [
				ApiService,
				{
					provide: AccountService,
					useValue: {
						getAccount: () => new AccountVO({ accountId: 1 }),
					},
				},
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DirectiveDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should switch to edit mode with the selected directive', () => {
		const directive = buildDirective(
			'directive-1',
			'first@example.com',
			'note',
		);
		component.switchToEdit(directive);

		expect(component.mode).toBe('edit');
		expect(component.editing).toBe(directive);
	});

	it('should switch to edit mode with null when adding a new steward', () => {
		component.switchToEdit(null);

		expect(component.mode).toBe('edit');
		expect(component.editing).toBeNull();
	});

	it('should append a saved directive when its id is not in the list', () => {
		component.directives = [
			buildDirective('directive-1', 'first@example.com', 'one'),
		];
		const newDirective = buildDirective(
			'directive-2',
			'second@example.com',
			'two',
		);

		component.saveEditedDirective(newDirective);

		expect(component.directives.length).toBe(2);
		expect(component.directives[1]).toBe(newDirective);
		expect(component.mode).toBe('display');
		expect(component.editing).toBeNull();
	});

	it('should replace a saved directive when its id matches an existing entry', () => {
		const existing = buildDirective('directive-1', 'old@example.com', 'old');
		component.directives = [existing];
		const updated = buildDirective('directive-1', 'new@example.com', 'new');

		component.saveEditedDirective(updated);

		expect(component.directives.length).toBe(1);
		expect(component.directives[0]).toBe(updated);
		expect(component.directives[0]).not.toBe(existing);
	});
});
