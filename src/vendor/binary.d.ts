import { Stream } from "stream";

declare class BinaryClient {
  public streams: any;
  constructor(socket: string, options: any);

  send(data: Stream | Buffer | Blob | File | ArrayBuffer | object | string);
  close();
  createReadStream(meta: any);
}

declare var binaryFeatures: {
  useBlobBuilder: boolean;
  useArrayBufferView: boolean;
  supportsBinaryWebsockets: boolean;
}