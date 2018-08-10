import { Stream } from "stream";
import { EventEmitter } from "events";

declare class BinaryClient extends EventEmitter {
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