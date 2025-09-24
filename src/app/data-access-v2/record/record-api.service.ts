import { Injectable } from '@angular/core';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class RecordApiService {
	constructor(private http: HttpV2Service) {}

	public async getRecordbyId(recordId: number): Promise<any> {
		const response = await firstValueFrom(
			this.http.get<any>(
				'v2/record',
				{ recordIds: [recordId] }),
		);
		return response;
	}
}
