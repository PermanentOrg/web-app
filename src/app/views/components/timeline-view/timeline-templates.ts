import { compile } from 'handlebars';

export const TimelineLineTemplate = `
<div class="timeline-line"></div>
`;
export const TimelineRecordTemplate = compile(`
<div class="timeline-item timeline-record">
  <img src={{item.thumbnailUrl}} style="width:{{imageWidth}}" height="{{imageHeight}}" width="{{imageWidth}}">
</div>
`);

export const TimelineFolderTemplate = compile(`
<div class="timeline-item timeline-folder">
  <img src={{item.thumbnailUrl}} style="width:{{imageWidth}}">
  <div>
    <div class="timeline-folder-name">{{item.displayName}}</div>
    {{#if item.FolderSizeVO}}
      <div class="timeline-folder-count">{{item.FolderSizeVO.allRecordCountDeep}} items</div>
    {{/if}}
  </div>
</div>
`);

export const TimelineGroupTemplate = compile(`
<div class="timeline-item timeline-group">
  <div class="timeline-group-preview">
    {{#each previewThumbs}}
      <div style="background-image: url({{this}})"></div>
    {{/each}}
  </div>
  <div>
    <div class="timeline-group-name">{{groupName}}</div>
    <div class="timeline-group-count">{{groupItems.length}} items</div>
  </div>
</div>
`);
