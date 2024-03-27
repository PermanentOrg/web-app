import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { MixpanelData, MixpanelService } from './mixpanel.service';

describe('MixpanelRepo', () => {
  let repo: MixpanelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    repo = new MixpanelService(TestBed.inject(HttpV2Service));
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  function prepareAccountStorage(
    accountId: string,
    useLocalStorage: boolean = true
  ) {
    const accountInfo = JSON.stringify({ accountId });
    if (useLocalStorage) {
      localStorage.setItem('account', accountInfo);
    } else {
      sessionStorage.setItem('account', accountInfo);
    }
  }

  it('should send correct data with analyticsDebug=false', async () => {
    prepareAccountStorage('12345');
    environment.analyticsDebug = false;

    const testData: MixpanelData = {
      entity: 'account',
      action: 'login',
      version: 1,
      entityId: 'testEntityId',
      body: { analytics: { event: 'testEvent', data: {} } },
    };

    repo.update(testData).then((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/v2/event`);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.body.analytics.distinctId).toEqual('12345');
    req.flush({ success: true });
  });

  it('should send correct data with analyticsDebug=true', async () => {
    prepareAccountStorage('67890');
    environment.analyticsDebug = true;

    const testData: MixpanelData = {
      entity: 'account',
      action: 'login',
      version: 1,
      entityId: 'testEntityId',
      body: { analytics: { event: 'testEvent', data: {} } },
    };

    repo.update(testData).then((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/v2/event`);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.body.analytics.distinctId).toEqual(
      `${environment.environment}:67890`
    );
    req.flush({ success: true });
  });

  it('should prefer localStorage over sessionStorage', async () => {
    prepareAccountStorage('12345', true); // localStorage
    prepareAccountStorage('67890', false); // sessionStorage
    environment.analyticsDebug = false;

    const testData: MixpanelData = {
      entity: 'account',
      action: 'login',
      version: 1,
      entityId: 'testEntityId',
      body: { analytics: { event: 'testEvent', data: {} } },
    };

    repo.update(testData).then((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/v2/event`);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.body.analytics.distinctId).toEqual('12345');
    req.flush({ success: true });
  });
});
