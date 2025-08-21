import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumbs/breadcrumb.component';
import { DragTargetRouterLinkDirective } from '@shared/directives/drag-target-router-link.directive';
import { DragTargetDroppableComponent } from './drag.service';

export function getItemFromDropTarget(
	dropTarget: DragTargetDroppableComponent,
) {
	if (dropTarget instanceof FileListItemComponent) {
		return dropTarget.item;
	} else if (dropTarget instanceof BreadcrumbComponent) {
		return dropTarget.breadcrumb;
	} else if (dropTarget instanceof DragTargetRouterLinkDirective) {
		return dropTarget.getFolderTypeFromLink();
	}
}
