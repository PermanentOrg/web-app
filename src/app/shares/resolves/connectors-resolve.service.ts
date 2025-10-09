import { Injectable } from '@angular/core';
import {
	Resolve,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';

import { ConnectorResponse } from '@shared/services/api/index.repo';
import { ConnectorOverviewVO } from '@root/app/models';

@Injectable()
export class ConnectorsResolveService implements Resolve<any> {
	constructor(
		private api: ApiService,
		private accountService: AccountService,
	) {}

	resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<any> | Promise<any> {
		const archiveId = this.accountService.getArchive().archiveId;
		const connectors = [
			new ConnectorOverviewVO({
				archiveId,
				type: 'type.connector.facebook',
			}),
		];

		return this.api.connector
			.getOverview(connectors)
			.pipe(
				map((response: ConnectorResponse) => {
					if (!response.isSuccessful) {
						throw response;
					}

					return response.getConnectorOverviewVOs();
				}),
			)
			.toPromise()
			.catch((error) => {
				throw error;
			});
	}
}
