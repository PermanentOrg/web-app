export class RequestVO {
  constructor(public apiKey: String, public csrf: String, public data: any[]) {
    console.log('request-vo.ts', 3, 'new request vo', this);
  }
}
