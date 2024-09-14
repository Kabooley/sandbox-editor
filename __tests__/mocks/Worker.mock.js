class Worker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = this.onmessage.bind(this);
    this.postMessage = this.postMessage.bind(this);
  }
  postMessage(msg) {
    this.onmessage(msg);
  }
  onmessage(msg) {
    console.log('[mocked-worker] ' + msg);
  }
}

Object.defineProperty(window, 'Worker', {
  writable: true,
  value: Worker,
});
