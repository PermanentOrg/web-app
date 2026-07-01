import {
	Component,
	Input,
	OnChanges,
	HostBinding,
	ChangeDetectionStrategy,
} from '@angular/core';
import { TagVOData } from '@models/tag-vo';
import { orderBy } from 'lodash';
import { ngIfScaleAnimationDynamic } from '@shared/animations';

@Component({
	selector: 'pr-tags',
	templateUrl: './tags.component.html',
	styleUrls: ['./tags.component.scss'],
	animations: [ngIfScaleAnimationDynamic],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class TagsComponent implements OnChanges {
	@Input() tags: TagVOData[];
	@HostBinding('class.read-only') @Input() readOnly = true;
	@Input() canEdit = false;
	@Input() isEditing = false;
	@Input() animate = false;
	@Input() isDialog = false;

	orderedTags: TagVOData[] = [];
	hoveredMetadataId = null;

	ngOnChanges() {
		if (this.tags?.length) {
			while (this.orderedTags.length) {
				this.orderedTags.pop();
			}
			const ordered = orderBy(this.tags, 'name');
			for (const i of ordered) {
				this.orderedTags.push(i);
			}
		} else {
			this.orderedTags = [];
		}
	}

	tagTrackByFn(index, tag: TagVOData) {
		return tag.name;
	}
}
