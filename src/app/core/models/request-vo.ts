export class RequestVO {
  constructor(public apiKey: String, public csrf: String, public data: any[]) {
  }
}
