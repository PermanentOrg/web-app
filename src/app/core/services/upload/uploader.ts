import { BinaryClient, binaryFeatures } from '@root/vendor/binary';

const SOCKET_CHUNK_SIZE = 122880;

export class Uploader {
  private socketClient: BinaryClient;

  constructor() {
    if (binaryFeatures.supportsBinaryWebsockets) {
      this.openSocketConnection();
    } else {
      window.alert('Your device does not support uploading.');
    }
  }

  openSocketConnection() {
    if (!this.socketClient) {
      this.socketClient = new BinaryClient(`wss://${location.hostname}:9000/uploadsvc`, {
        chunkSize: SOCKET_CHUNK_SIZE
      });
    }
  }

  closeSocketConnection() {
    if (this.socketClient) {
      this.socketClient.close();
    }
  }
}
