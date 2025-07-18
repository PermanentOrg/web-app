/* @format */
import { TestBed, inject } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import {
  ArchiveVO,
  Directive,
  DirectiveCreateRequest,
  DirectiveUpdateRequest,
} from '@models/index';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { DirectiveRepo } from './directive.repo';

const apiUrl = (endpoint: string) => `${environment.apiUrl}${endpoint}`;

describe('DirectiveRepo', () => {
  let repo: DirectiveRepo;
  let httpMock: HttpTestingController;
  const testArchive = new ArchiveVO({ archiveId: 1234 });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        HttpService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    repo = new DirectiveRepo(
      TestBed.inject(HttpService),
      TestBed.inject(HttpV2Service),
    );
    httpMock = TestBed.inject(HttpTestingController);

    repo.httpV2.setAuthToken('test_token');
  });

  it('should exist', () => {
    expect(repo).not.toBeNull();
  });

  it('can get a Directive from an Archive', (done) => {
    repo.httpV2.setAuthToken('test_token');
    repo
      .get(testArchive)
      .then((directive) => {
        expect(directive).not.toBeNull();
        expect(directive.note).toBe('Test Note');
        done();
      })
      .catch(done.fail);

    const req = httpMock.expectOne(apiUrl('/v2/directive/archive/1234'));

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush([
      {
        directiveId: 'abcd1234',
        archiveId: 1,
        type: 'transfer',
        createdDt: new Date(),
        updatedDt: new Date(),
        trigger: {
          directiveTriggerId: '1234abcd',
          directiveId: 'abcd1234',
          type: 'admin',
          createdDt: new Date(),
          updatedDt: new Date(),
        },
        stewardAccountId: 2,
        note: 'Test Note',
        executionDt: null,
      },
    ]);
  });

  it('can create a new Directive for an archive', (done) => {
    const newDirectiveData: DirectiveCreateRequest = {
      archiveId: 1,
      stewardEmail: 'test@test.test',
      type: 'transfer',
      note: 'Test Note',
      trigger: {
        type: 'admin',
      },
    };
    repo
      .create(newDirectiveData)
      .then((directive) => {
        expect(directive instanceof Directive).toBeTrue();
        expect(directive.archiveId).toBe(1);
        done();
      })
      .catch(done.fail);

    const req = httpMock.expectOne(apiUrl('/v2/directive'));

    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(new Directive(newDirectiveData));
  });

  it('can update an existing directive', (done) => {
    const directiveUpdate: DirectiveUpdateRequest = {
      directiveId: 'test-id',
      note: 'New Note',
    };

    repo
      .update(directiveUpdate)
      .then((directive) => {
        expect(directive instanceof Directive).toBeTrue();
        expect(directive.directiveId).toBe('test-id');
        expect(directive.note).toBe('New Note');
        done();
      })
      .catch(done.fail);

    const req = httpMock.expectOne(apiUrl('/v2/directive/test-id'));

    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.body.directiveId).toBeUndefined();
    req.flush(new Directive(directiveUpdate));
  });

  it('will throw an error if no directiveId is specified in update', async () => {
    await expectAsync(
      repo.update({ note: 'New Note' } as DirectiveUpdateRequest),
    ).toBeRejected();
  });

  it('can get a legacy contact', (done) => {
    repo
      .getLegacyContact()
      .then((legacyContact) => {
        expect(legacyContact.legacyContactId).toBe('test-id');
        expect(legacyContact.accountId).toBe('test-accountid');
        expect(legacyContact.name).toBe('Test Legacy Contact');
        expect(legacyContact.email).toBe('test@example.com');
        done();
      })
      .catch(done.fail);

    const req = httpMock.expectOne(apiUrl('/v2/legacy-contact'));

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush([
      {
        legacyContactId: 'test-id',
        accountId: 'test-accountid',
        name: 'Test Legacy Contact',
        email: 'test@example.com',
      },
    ]);
  });

  it('can create a legacy contact', (done) => {
    repo
      .createLegacyContact({
        name: 'New User',
        email: 'new@example.com',
      })
      .then((legacyContact) => {
        expect(legacyContact.legacyContactId).toBe('test-id');
        expect(legacyContact.accountId).toBe('test-accountid');
        expect(legacyContact.name).toBe('New User');
        expect(legacyContact.email).toBe('new@example.com');
        done();
      })
      .catch(done.fail);

    const req = httpMock.expectOne(apiUrl('/v2/legacy-contact'));

    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.body.name).toBe('New User');
    expect(req.request.body.email).toBe('new@example.com');
    req.flush({
      legacyContactId: 'test-id',
      accountId: 'test-accountid',
      name: 'New User',
      email: 'new@example.com',
    });
  });

  it('can update a legacy contact', (done) => {
    repo
      .updateLegacyContact({
        legacyContactId: 'test-id',
        name: 'Updated User',
        email: 'updated@example.com',
      })
      .then((legacyContact) => {
        expect(legacyContact.legacyContactId).toBe('test-id');
        expect(legacyContact.accountId).toBe('test-accountid');
        expect(legacyContact.name).toBe('Updated User');
        expect(legacyContact.email).toBe('updated@example.com');
        done();
      })
      .catch(done.fail);

    const req = httpMock.expectOne(apiUrl('/v2/legacy-contact/test-id'));

    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.body.name).toBe('Updated User');
    expect(req.request.body.email).toBe('updated@example.com');
    expect(req.request.body.legacyContactId).toBeUndefined();
    req.flush({
      legacyContactId: 'test-id',
      accountId: 'test-accountid',
      name: 'Updated User',
      email: 'updated@example.com',
    });
  });

  it('will throw an error if no legacyContactId is specified in update', async () => {
    await expectAsync(
      repo.updateLegacyContact({
        name: 'throw error',
        email: 'error@example.com',
      }),
    ).toBeRejected();
  });
});
