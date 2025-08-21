import { SharedModule } from '@shared/shared.module';
import { Shallow } from 'shallow-render';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventObserver, EventService } from './event.service';
import { PermanentEvent } from './event-types';

describe('EventService', () => {
	let shallow: Shallow<EventService>;
	beforeEach(() => {
		shallow = new Shallow(EventService, SharedModule).import(
			HttpClientTestingModule,
		);
	});

	it('should be created', async () => {
		const { instance } = await shallow.createService();

		expect(instance).toBeTruthy();
	});

	it('should add an observer', async () => {
		const { instance } = await shallow.createService();
		const mockObserver: EventObserver = {
			update: async (_: PermanentEvent) => {},
		};

		instance.addObserver(mockObserver);

		expect(instance['observers']).toContain(mockObserver);
	});

	it('should notify all observers', async () => {
		const { instance } = await shallow.createService();
		const mockObserver1: EventObserver = {
			update: jasmine.createSpy('update'),
		};
		const mockObserver2: EventObserver = {
			update: jasmine.createSpy('update'),
		};

		instance.addObserver(mockObserver1);
		instance.addObserver(mockObserver2);

		const eventData: PermanentEvent = {
			entity: 'account',
			action: 'login',
		};
		instance.dispatch(eventData);

		expect(mockObserver1.update).toHaveBeenCalledWith(eventData);
		expect(mockObserver2.update).toHaveBeenCalledWith(eventData);
	});

	it('should remove an observer', async () => {
		const { instance } = await shallow.createService();
		const mockObserver: EventObserver = {
			update: jasmine.createSpy('update'),
		};

		instance.addObserver(mockObserver);
		instance.removeObserver(mockObserver);
		instance.dispatch({
			entity: 'account',
			action: 'login',
		});

		expect(mockObserver.update).not.toHaveBeenCalled();
	});

	it('should not notify removed observers', async () => {
		const { instance } = await shallow.createService();
		const mockObserver: EventObserver = {
			update: jasmine.createSpy('update'),
		};
		const mockObserver2: EventObserver = {
			update: jasmine.createSpy('update'),
		};

		instance.addObserver(mockObserver);
		instance.addObserver(mockObserver2);
		instance.removeObserver(mockObserver);

		instance.dispatch({
			entity: 'account',
			action: 'login',
		});

		expect(mockObserver.update).not.toHaveBeenCalled();
	});
});
