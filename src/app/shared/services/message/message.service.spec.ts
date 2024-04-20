/* @format */
import { TestBed } from '@angular/core/testing';

import {
  MessageService,
  MessageDisplayOptions,
} from '@shared/services/message/message.service';
import { MessageComponent } from '@shared/components/message/message.component';
import { PrConstantsService } from '../pr-constants/pr-constants.service';

describe('MessageService', () => {
  let service: MessageService;
  let mockPrConstantsService: Partial<PrConstantsService>;
  let mockMessageComponent: Partial<MessageComponent>;

  beforeEach(() => {
    mockPrConstantsService = {
      translate: (key: string) => `Translated: ${key}`,
    };

    mockMessageComponent = {
      display: jasmine.createSpy('display'),
    };

    TestBed.configureTestingModule({
      providers: [
        MessageService,
        { provide: PrConstantsService, useValue: mockPrConstantsService },
      ],
    });
    service = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw error if component is not registered', () => {
    const messageData: MessageDisplayOptions = { message: 'Test message' };

    expect(() => service.showMessage(messageData)).toThrowError(
      'MessageService - Missing component'
    );
  });

  it('should register a component successfully', () => {
    expect(() =>
      service.registerComponent(mockMessageComponent as MessageComponent)
    ).not.toThrow();
  });

  it('should throw error if trying to register more than one component', () => {
    service.registerComponent(mockMessageComponent as MessageComponent);

    expect(() =>
      service.registerComponent(mockMessageComponent as MessageComponent)
    ).toThrowError('MessageService - Message component already registered');
  });

  it('should display a message correctly without translation', () => {
    service.registerComponent(mockMessageComponent as MessageComponent);
    const messageData: MessageDisplayOptions = {
      message: 'Test message',
      translate: false,
    };
    service.showMessage(messageData);

    expect(mockMessageComponent.display).toHaveBeenCalledWith(messageData);
  });

  it('should handle showing error messages correctly', () => {
    service.registerComponent(mockMessageComponent as MessageComponent);
    const errorMessage: MessageDisplayOptions = {
      message: 'Error occurred',
      translate: false,
    };
    service.showError(errorMessage);

    expect(mockMessageComponent.display).toHaveBeenCalledWith({
      ...errorMessage,
      style: 'danger',
    });
  });
});
