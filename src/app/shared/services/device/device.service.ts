import { Injectable, Optional } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

const MOBILE_USER_AGENT_MATCH = /android|blackberry|iphone|ipod|iemobile|opera mobile|palmos|webos|googlebot-mobile/i;
const IOS_USER_AGENT_MATCH = /ipad|ipod|iphone/i;

export function isMobileWidth() {
  return !(window.matchMedia('(min-width: 900px)').matches);
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(
    @Optional() private cookies?: CookieService
  ) { }

  isMobileWidth() {
    return isMobileWidth();
  }

  isMobile() {
    return !!navigator.userAgent.match(MOBILE_USER_AGENT_MATCH);
  }

  isIos() {
    return !!navigator.userAgent.match(IOS_USER_AGENT_MATCH);
  }

  didOptOut() {
    return this.cookies?.check('permBetaOptOut');
  }
}
