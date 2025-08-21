export interface ChecklistItem {
	id: string;
	title: string;
	completed: boolean;
}

export interface ChecklistApiResponse {
	checklistItems: ChecklistItem[];
}
