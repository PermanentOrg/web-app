import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchiveVO } from '@models';
import { ProfileItemVOData } from '@models/profile-item-vo';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { first } from 'rxjs/operators';
import { PublicProfileComponent } from './public-profile.component';

describe('PublicProfileComponent', () => {
	let component: PublicProfileComponent;
	let fixture: ComponentFixture<PublicProfileComponent>;
	let service: PublicProfileService;

	const milestoneItems: ProfileItemVOData[] = [
		{ fieldNameUI: 'profile.milestone', string1: 'Oldest', day1: '1990-01-01' },
		{ fieldNameUI: 'profile.milestone', string1: 'Middle', day1: '2000-06-15' },
		{ fieldNameUI: 'profile.milestone', string1: 'Newest', day1: '2010-12-31' },
	];

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PublicProfileComponent],
			providers: [PublicProfileService],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		service = TestBed.inject(PublicProfileService);
		fixture = TestBed.createComponent(PublicProfileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should sort milestones newest first when milestoneSortOrder is reverse_chronological', (done) => {
		service.setArchive(
			new ArchiveVO({ milestoneSortOrder: 'reverse_chronological' }),
		);
		service.setProfileItems(milestoneItems);

		component.milestones$.pipe(first()).subscribe((milestones) => {
			expect(milestones[0].string1).toBe('Newest');
			expect(milestones[2].string1).toBe('Oldest');
			done();
		});
	});

	it('should sort milestones oldest first when milestoneSortOrder is chronological', (done) => {
		service.setArchive(new ArchiveVO({ milestoneSortOrder: 'chronological' }));
		service.setProfileItems(milestoneItems);

		component.milestones$.pipe(first()).subscribe((milestones) => {
			expect(milestones[0].string1).toBe('Oldest');
			expect(milestones[2].string1).toBe('Newest');
			done();
		});
	});

	it('should default to newest first when milestoneSortOrder is not set', (done) => {
		service.setArchive(new ArchiveVO({}));
		service.setProfileItems(milestoneItems);

		component.milestones$.pipe(first()).subscribe((milestones) => {
			expect(milestones[0].string1).toBe('Newest');
			expect(milestones[2].string1).toBe('Oldest');
			done();
		});
	});
});
