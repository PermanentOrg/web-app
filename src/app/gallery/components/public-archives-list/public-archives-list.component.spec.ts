import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { Router } from '@angular/router';
import { ArchiveVO } from '../../../models/archive-vo';
import { PublicArchivesListComponent } from './public-archives-list.component';

@Pipe({ name: 'accessRole', standalone: false })
class MockAccessRolePipe implements PipeTransform {
	transform(value: string): string {
		return value || '';
	}
}

const mockAccountService = {
	getAllPublicArchives: async () => await Promise.resolve([]),
};

const mockMessageService = {
	showError: () => {},
};

const mockRouter = {
	navigate: jasmine
		.createSpy('navigate')
		.and.returnValue(Promise.resolve(true)),
};

describe('PublicArchivesComponent', () => {
	let fixture: ComponentFixture<PublicArchivesListComponent>;
	let component: PublicArchivesListComponent;

	beforeEach(async () => {
		mockRouter.navigate.calls.reset();

		await TestBed.configureTestingModule({
			declarations: [PublicArchivesListComponent, MockAccessRolePipe],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: MessageService, useValue: mockMessageService },
				{ provide: Router, useValue: mockRouter },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PublicArchivesListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should show all the public archives of the user', async () => {
		await fixture.whenStable();
		component.publicArchives = [
			new ArchiveVO({ archiveNbr: 1, name: 'test', public: 1 }),
			new ArchiveVO({ archiveNbr: 2, name: 'test2', public: 1 }),
		];
		fixture.detectChanges();

		const archives = fixture.nativeElement.querySelectorAll('.public-archive');

		expect(archives.length).toEqual(2);
	});

	it('should display the "no archives" element', async () => {
		await fixture.whenStable();
		component.publicArchives = [];
		fixture.detectChanges();

		const element = fixture.nativeElement.querySelector('.no-archives');

		expect(element).toBeTruthy();
	});

	it('should redirect the user to the archive when clicking on it', () => {
		const archive = new ArchiveVO({ archiveNbr: 1, name: 'test', public: 1 });
		component.goToArchive(archive);
		fixture.detectChanges();

		expect(mockRouter.navigate).toHaveBeenCalledWith([
			'/p/archive',
			archive.archiveNbr,
		]);
	});

	it('should expand the archives list when clicking "See more" on mobile', async () => {
		await fixture.whenStable();
		component.publicArchives = [
			new ArchiveVO({ archiveNbr: 1, name: 'test', public: 1 }),
			new ArchiveVO({ archiveNbr: 2, name: 'test2', public: 1 }),
		];
		component.toggleArchives();
		fixture.detectChanges();

		expect(component.expanded).toBeTrue();

		const archiveList = fixture.nativeElement.querySelector(
			'.public-archives-list',
		);

		expect(archiveList.classList).toContain('public-archives-list-expanded');
	});
});
