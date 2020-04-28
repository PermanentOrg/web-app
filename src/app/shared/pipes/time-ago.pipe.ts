import { TimeAgoPipe } from 'time-ago-pipe';
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'timeAgo' })
export class TimeAgoV9Pipe extends TimeAgoPipe implements PipeTransform {}
