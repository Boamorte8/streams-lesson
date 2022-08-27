import { Readable, Writable } from 'stream';

class StreamConcatWritable extends Writable {
  constructor(opts) {
    super(opts);
    this.data = '';
  }

  _write(chunk, encoding, callback) {
    console.log('CALL _WRITE');

    setTimeout(() => {
      console.log('CALLBACK _WRITE', chunk.toString());
      if (encoding === 'buffer') chunk = chunk.toString();

      this.data += chunk;

      callback();
    }, 4000);
  }
}

class StreamCounterReadable extends Readable {
  constructor(opts) {
    super(opts);
    this.max = 10;
    this.index = 1;
  }

  _read() {
    console.log('CALL _READ');

    setTimeout(() => {
      console.log('CALLBACK _READ', this.index);
      if (this.index > this.max) this.push(null);
      else this.push(Buffer.from(this.index.toString()));

      this.index++;
    }, 2000);
  }
}

const streamConcatWritable = new StreamConcatWritable({
  highWaterMark: 2,
  objectMode: true,
});

// For the readable you can add highWaterMark too
const streamConcatReadable = new StreamCounterReadable({
  objectMode: true,
});

streamConcatReadable.on('data', (data) => {
  console.log('DATA');
  const ok = streamConcatWritable.write(data, (err) => err && console.log(err));

  if (!ok) {
    streamConcatReadable.pause();
    console.log('READ PAUSE');
    streamConcatWritable.once('drain', () => {
      console.log('DRAIN');
      streamConcatReadable.resume();
    });
  }
});

streamConcatReadable.on('close', () => {
  streamConcatWritable.end();
});

streamConcatWritable.on('close', () => {
  console.log('END DATA', streamConcatWritable.data);
});
