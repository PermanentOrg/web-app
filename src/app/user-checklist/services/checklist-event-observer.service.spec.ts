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

	it('should convert update() calls to a Subject.next() call', () => new Promise<void>((resolve, reject) => {
		service.getSubject().subscribe(() => {
			resolve();
		});

		service.update({
			action: 'initiate_upload',
			entity: 'account',
		});
	}));
});
