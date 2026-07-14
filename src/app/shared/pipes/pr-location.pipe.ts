import { Pipe, PipeTransform } from '@angular/core';
import { LocnVOData } from '@models';

export interface LocnPipeOutput {
	line1?: string;
	line2?: string;
	full?: string;
	name?: string;
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

		const hasCoordinates =
			locnVO.latitude != null &&
			locnVO.latitude !== '' &&
			locnVO.longitude != null &&
			locnVO.longitude !== '';

		// order by priority/usefulness
		const queue = [
			locnVO.sublocation,
			locnVO.city,
			locnVO.adminOneName,
			hasCoordinates ? `${locnVO.latitude}, ${locnVO.longitude}` : null,
			locnVO.country,
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
		// Surface the name whenever it exists; it is rendered distinctly (bold,
		// on its own line), so it does not need deduping against the sublocation.
		if (locnVO.name) {
			output.name = locnVO.name;
			output.full = locnVO.name + ', ' + output.full;
		}
		return output;
	}
}
