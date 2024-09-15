// https://vitest.dev/guide/mocking#globals
import { vi } from 'vitest';

class Worker_ {
  url: string;
  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = this.onmessage.bind(this);
    this.postMessage = this.postMessage.bind(this);
  }
  onmessage(msg: string) {
    console.log(msg);
  }
  postMessage(msg: string) {
    this.onmessage(msg);
  }
}

vi.stubGlobal('Worker', Worker_);
