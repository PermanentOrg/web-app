export class RequestVO {
  constructor(public apiKey: string, public csrf: string, public data: any) {
  }
}
