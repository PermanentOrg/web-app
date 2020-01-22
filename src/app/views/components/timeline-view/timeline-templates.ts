import { compile } from 'handlebars';

export const TimelineRecordTemplate = compile(`
<div class="timeline-item timeline-record">
  {{item.displayName}}
</div>
`);

export const TimelineFolderTemplate = compile(`
<div class="timeline-item timeline-folder">
  {{item.displayName}}
</div>
`);

export const TimelineGroupTemplate = compile(`
<div class="timeline-item timeline-group">
  {{groupName}}
</div>
`);
