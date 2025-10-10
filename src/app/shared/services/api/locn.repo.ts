import { LocnVOData } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';

export class LocnRepo extends BaseRepo {
	public async geomapLatLng(lat: number, lng: number) {
		const vo: LocnVOData = {
			latitude: lat,
			longitude: lng,
		};

		const data = [
			{
				LocnVO: vo,
			},
		];

		return await this.http.sendRequestPromise<LocnResponse>(
			'/locn/geomapLatLong',
			data,
			{ ResponseClass: LocnResponse },
		);
	}

	public async create(locn: LocnVOData) {
		const data = [
			{
				LocnVO: locn,
			},
		];

		return await this.http.sendRequestPromise<LocnResponse>(
			'/locn/post',
			data,
			{
				ResponseClass: LocnResponse,
			},
		);
	}

	public async update(locn: LocnVOData) {
		const data = [
			{
				LocnVO: locn,
			},
		];

		return await this.http.sendRequestPromise<LocnResponse>(
			'/locn/update',
			data,
			{
				ResponseClass: LocnResponse,
			},
		);
	}
}

export class LocnResponse extends BaseResponse {
	public getLocnVO(): LocnVOData {
		const data = this.getResultsData();
		if (!data || !data.length) {
			return null;
		}

		return data[0][0].LocnVO as LocnVOData;
	}

	public getLocnVOs(): LocnVOData[] {
		const data = this.getResultsData();

		if (!data[0]) {
			return [];
		}

		return data[0].map((result) => result.LocnVO as LocnVOData);
	}
}
