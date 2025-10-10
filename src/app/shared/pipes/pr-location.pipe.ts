import { Pipe, PipeTransform } from '@angular/core';
import { LocnVOData } from '@models';

export interface LocnPipeOutput {
	line1?: string;
	line2?: string;
	full?: string;
	displayName?: string;
}

@Pipe({
	name: 'prLocation',
	standalone: false,
})
export class PrLocationPipe implements PipeTransform {
	transform(locnVO: LocnVOData): LocnPipeOutput {
		if (!locnVO) {
			return null;
		}

		const output: LocnPipeOutput = {};

		// order by priority/usefulness
		const queue = [
			locnVO.streetNumber
				? locnVO.streetNumber + ' ' + locnVO.streetName
				: locnVO.streetName,
			locnVO.locality,
			locnVO.adminOneName,
			locnVO.latitude + ', ' + locnVO.longitude,
			locnVO.country,
			locnVO.countryCode,
		];

		const line2 = [];

		// step through, fill line 1 first, fill line 2 as needed
		queue.forEach((item, i) => {
			if (!item) {
				return;
			}
			if (!output.line1) {
				output.line1 = item;
			} else if (
				!(i === 3 || (line2.length > 1 && i === 4) || line2.length > 2)
			) {
				line2.push(item);
				if (i === 4) {
					return false;
				}
			}
		});

		output.line2 = line2.length ? line2.join(', ') : 'Unknown Location';
		output.full = output.line1 + ', ' + output.line2;
		if (locnVO.displayName) {
			if (locnVO.displayName.toLowerCase() !== output.line1.toLowerCase()) {
				output.displayName = locnVO.displayName;
				output.full = locnVO.displayName + ', ' + output.full;
			}
		}
		return output;
	}
}
