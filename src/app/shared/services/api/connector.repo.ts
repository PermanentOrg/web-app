import { ArchiveVO, ConnectorOverviewVO, SimpleVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { Observable } from 'rxjs';

export class ConnectorRepo extends BaseRepo {
	public getOverview(
		connectors: ConnectorOverviewVO[],
	): Observable<ConnectorResponse> {
		return this.http.sendRequest<ConnectorResponse>(
			'/connector/getOverview',
			connectors,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public familysearchConnect(archive: ArchiveVO) {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return this.http.sendRequest<ConnectorResponse>(
			'/connector/familysearchSetup',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async familysearchAuthorize(archive: ArchiveVO, code: string) {
		const simpleVo = new SimpleVO({
			key: 'oauthCode',
			value: code,
		});

		const data = [
			{
				ArchiveVO: archive,
				SimpleVO: simpleVo,
			},
		];

		return await this.http.sendRequestPromise<ConnectorResponse>(
			`/connector/familysearchAuthorize`,
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public familysearchDisconnect(archive: ArchiveVO) {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return this.http.sendRequest<ConnectorResponse>(
			'/connector/familysearchDisconnect',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async getFamilysearchUser(archive: ArchiveVO): Promise<any> {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ConnectorResponse>(
			'/connector/getFamilysearchUser',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async getFamilysearchTreeUser(archive: ArchiveVO): Promise<any> {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ConnectorResponse>(
			'/connector/getFamilysearchTreeUser',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async getFamilysearchAncestry(
		archive: ArchiveVO,
		personId: string,
	): Promise<any> {
		const data = [
			{
				ArchiveVO: archive,
				SimpleVO: new SimpleVO({ key: 'personId', value: personId }),
			},
		];

		return await this.http.sendRequestPromise<ConnectorResponse>(
			'/connector/getFamilysearchAncestry',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async getFamilysearchMemories(
		archive: ArchiveVO,
		personId: string,
	): Promise<any> {
		const data = [
			{
				ArchiveVO: archive,
				SimpleVO: new SimpleVO({ key: 'personId', value: personId }),
			},
		];

		return await this.http.sendRequestPromise<ConnectorResponse>(
			'/connector/getFamilysearchMemories',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async familysearchMemoryImportRequest(
		archive: ArchiveVO | ArchiveVO[],
		personId?: string | string[],
	): Promise<any> {
		if (!Array.isArray(archive)) {
			archive = [archive];
		}

		if (personId && !Array.isArray(personId)) {
			personId = [personId];
		}

		let data;

		if (personId) {
			data = archive.map((vo, i) => ({
				ArchiveVO: vo,
				SimpleVO: new SimpleVO({ key: 'personId', value: personId[i] }),
			}));
		} else {
			data = archive.map((vo, i) => ({
				ArchiveVO: vo,
			}));
		}

		return await this.http.sendRequestPromise<ConnectorResponse>(
			'/connector/familysearchMemoryImportRequest',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async familysearchMemorySyncRequest(
		archive: ArchiveVO | ArchiveVO[],
	): Promise<any> {
		if (!Array.isArray(archive)) {
			archive = [archive];
		}

		const data = archive.map((vo) => ({
			ArchiveVO: vo,
		}));

		return await this.http.sendRequestPromise<ConnectorResponse>(
			'/connector/familysearchMemorySyncRequest',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async familysearchMemoryUploadRequest(
		archive: ArchiveVO | ArchiveVO[],
	): Promise<any> {
		if (!Array.isArray(archive)) {
			archive = [archive];
		}

		const data = archive.map((vo) => ({
			ArchiveVO: vo,
		}));

		return await this.http.sendRequestPromise<ConnectorResponse>(
			'/connector/familysearchMemoryUploadRequest',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}

	public async familysearchFactImportRequest(
		archive: ArchiveVO | ArchiveVO[],
		personId: string | string[],
	): Promise<any> {
		if (!Array.isArray(archive)) {
			archive = [archive];
		}

		if (!Array.isArray(personId)) {
			personId = [personId];
		}

		const data = archive.map((vo, i) => ({
			ArchiveVO: vo,
			SimpleVO: new SimpleVO({ key: 'personId', value: personId[i] }),
		}));

		return await this.http.sendRequestPromise<ConnectorResponse>(
			'/connector/familysearchFactImportRequest',
			data,
			{ ResponseClass: ConnectorResponse },
		);
	}
}

export class ConnectorResponse extends BaseResponse {
	public getConnectorOverviewVO() {
		const data = this.getResultsData();
		if (!data || !data.length) {
			return null;
		}

		return new ConnectorOverviewVO(data[0][0].ConnectorOverviewVO);
	}

	public getConnectorOverviewVOs() {
		const data = this.getResultsData();

		return data.map(
			(result) => new ConnectorOverviewVO(result[0].ConnectorOverviewVO),
		);
	}
}
