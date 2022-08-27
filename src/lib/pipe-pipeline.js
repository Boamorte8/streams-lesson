import { Readable, Writable, Transform, pipeline } from 'stream';

class StreamConcatWritable extends Writable {
  constructor(opts) {
    super(opts);
    this.data = '';
  }

  _write(chunk, encoding, callback) {
    setTimeout(() => {
      console.log('CALLBACK _WRITE', chunk.toString());

      this.data += chunk.toString();
      callback();
    }, 200);
  }
}

class StreamTextReadable extends Readable {
  constructor(input, opts) {
    super(opts);

    this.index = 0;
    this.input = input.split('');
  }

  _read() {
    setTimeout(() => {
      console.log('CALLBACK _READ', this.input[this.index]);
      if (this.index > this.input.length - 1) this.push(null);
      else this.push(this.input[this.index]);

      this.index++;
    }, 100);
  }
}

class StreamUpperCase extends Transform {
  _transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  }
}

const streamUpperCase = new StreamUpperCase({
  objectMode: true,
});

const streamConcatWritable = new StreamConcatWritable({
  objectMode: true,
  highWaterMark: 2,
});

const streamConcatReadable = new StreamTextReadable('Bienvenidos a todos', {
  objectMode: true,
  highWaterMark: 1,
});

// Pipe is a way to handle streams that helps to concat them and try to avoid problems of backpressure
// pipeline is other way to handle streams similar to pipe

// In the pipe method you can add a second parameter { end: false }
// This is to avoid that the readable stream is closed automatically
streamConcatReadable.pipe(streamUpperCase).pipe(streamConcatWritable);
streamConcatWritable.on('close', () => console.log(streamConcatWritable.data));

// A difference between pipe and pipeline is that pipe doesn't have an easy way to handle errors and pipeline have a callback to handle them properly
// In the case you want to handle errors you have to listen error event of every stream and close the others streams manually

pipeline(
  [streamConcatReadable, streamUpperCase, streamConcatWritable],
  (err) => {
    if (err) console.error('Pipeline fallido', err);
    else console.log(streamConcatWritable.data);
  }
);
