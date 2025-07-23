import { Pipe, PipeTransform } from '@angular/core';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

@Pipe({
	name: 'prConstants',
	standalone: false,
})
export class PrConstantsPipe implements PipeTransform {
	constructor(private prConstants: PrConstantsService) {}

	transform(value: any, args?: any): any {
		if (!value) {
			return value;
		}

		return this.prConstants.translate(value);
	}
}
