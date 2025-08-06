import { TestBed } from '@angular/core/testing';
import { ChecklistEventObserverService } from './checklist-event-observer.service';

describe('ChecklistEventObserverService', () => {
	let service: ChecklistEventObserverService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ChecklistEventObserverService);
		service.setDelay(0);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should convert update() calls to a Subject.next() call', (done) => {
		service.getSubject().subscribe(() => {
			done();
		});

		service.update({
			action: 'initiate_upload',
			entity: 'account',
		});
	});
});
