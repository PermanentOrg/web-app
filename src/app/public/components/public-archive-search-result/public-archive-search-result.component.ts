import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
} from '@angular/core';
import {
	ItemMatch,
	MilestoneMatch,
	PublicArchiveSearchResult,
} from '@public/types/public-archive-search';

type DisplayedMatch = MilestoneMatch | ItemMatch;

@Component({
	selector: 'pr-public-archive-search-result',
	templateUrl: './public-archive-search-result.component.html',
	styleUrls: ['./public-archive-search-result.component.scss'],
	standalone: false,
})
export class PublicArchiveSearchResultComponent implements OnChanges {
	@Input() result: PublicArchiveSearchResult;
	@Input() maxMatches = 3;

	@Output() archiveClick = new EventEmitter<PublicArchiveSearchResult>();
	@Output() matchClick = new EventEmitter<DisplayedMatch>();

	public displayedMatches: DisplayedMatch[] = [];
	public moreMatchCount = 0;

	ngOnChanges() {
		// An archive name match is already shown by the archive header, so only
		// milestone and item matches get their own line.
		const contentMatches = this.result.matches.filter(
			(match): match is DisplayedMatch => match.matchType !== 'archiveName',
		);
		const archiveNameMatchCount =
			this.result.matches.length - contentMatches.length;

		this.displayedMatches = contentMatches.slice(0, this.maxMatches);
		this.moreMatchCount = Math.max(
			0,
			this.result.totalMatchCount -
				archiveNameMatchCount -
				this.displayedMatches.length,
		);
	}

	onMatchClick(event: MouseEvent, match: DisplayedMatch) {
		event.stopPropagation();
		this.matchClick.emit(match);
	}
}
