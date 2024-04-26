/* @format */
import { SharedModule } from '@shared/shared.module';
import { Shallow } from 'shallow-render';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  AnalyticsObserver,
  AnalyticsService,
  EventData,
} from './analytics.service';

describe('AnalyticsService', () => {
  let shallow: Shallow<AnalyticsService>;
  beforeEach(() => {
    shallow = new Shallow(AnalyticsService, SharedModule).import(
      HttpClientTestingModule
    );
  });

  it('should be created', async () => {
    const { instance } = await shallow.createService();

    expect(instance).toBeTruthy();
  });

  it('should add an observer', async () => {
    const { instance } = await shallow.createService();
    const mockObserver: AnalyticsObserver = {
      update: async (data: EventData) => {},
    };

    instance.addObserver(mockObserver);

    expect(instance['observers']).toContain(mockObserver);
  });

  it('should notify all observers', async () => {
    const { instance } = await shallow.createService();
    const mockObserver1: AnalyticsObserver = {
      update: jasmine.createSpy('update'),
    };
    const mockObserver2: AnalyticsObserver = {
      update: jasmine.createSpy('update'),
    };

    instance.addObserver(mockObserver1);
    instance.addObserver(mockObserver2);

    const eventData: EventData = {
      entity: 'account',
      action: 'login',
      version: 1,
      entityId: 'testEntityId',
      body: {},
    };
    instance.notifyObservers(eventData);

    expect(mockObserver1.update).toHaveBeenCalledWith(eventData);
    expect(mockObserver2.update).toHaveBeenCalledWith(eventData);
  });

  it('should remove an observer', async () => {
    const { instance } = await shallow.createService();
    const mockObserver: AnalyticsObserver = {
      update: jasmine.createSpy('update'),
    };

    instance.addObserver(mockObserver);
    instance.removeObserver(mockObserver);
    const eventData: EventData = {
      entity: 'account',
      action: 'login',
      version: 1,
      entityId: 'testEntityId',
      body: {},
    };
    instance.notifyObservers(eventData);

    expect(mockObserver.update).not.toHaveBeenCalled();
  });

  it('should not notify removed observers', async () => {
    const { instance } = await shallow.createService();
    const mockObserver: AnalyticsObserver = {
      update: jasmine.createSpy('update'),
    };
    const mockObserver2: AnalyticsObserver = {
      update: jasmine.createSpy('update'),
    };

    instance.addObserver(mockObserver);
    instance.addObserver(mockObserver2);
    instance.removeObserver(mockObserver);

    const eventData: EventData = {
      entity: 'account',
      action: 'login',
      version: 1,
      entityId: 'testEntityId',
      body: {},
    };
    instance.notifyObservers(eventData);

    expect(mockObserver.update).not.toHaveBeenCalled();
  });
});
