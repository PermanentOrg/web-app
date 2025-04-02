import { HttpParameterCodec } from '@angular/common/http';

export class HttpV2Encoder implements HttpParameterCodec {
  public encodeKey(key: string): string {
    return encodeURIComponent(key).replace('%255B', '[').replace('%255D', ']');
  }

  public encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  public decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  public decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}
