import { Component, Input } from '@angular/core';

@Component({
  selector: 'pr-pending-archive',
  standalone: true,
  imports: [],
  templateUrl: './pending-archive.component.html',
  styleUrl: './pending-archive.component.scss',
})
export class PendingArchiveComponent {
  @Input() archiveName: string = '';
  @Input() role = '';
}
