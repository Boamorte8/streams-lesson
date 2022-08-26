import { Readable } from 'stream';

class StreamCounter extends Readable {
  constructor(opts) {
    super(opts);
    this.max = 10;
    this.index = 1;
  }

  _read() {
    if (this.index > this.max) this.push(null);
    else this.push(Buffer.from(this.index.toString()));

    this.index++;
  }
}

const streamCounter = new StreamCounter({ objectMode: true });

// Flowing
let accum = '';

streamCounter.on('data', (chunk) => (accum += chunk));
streamCounter.on('end', () => console.log(accum));

// Non-flowing
console.log(streamCounter.read());

// Ejemplo Non-flowing con estructura for await
for await (const chunk of streamCounter) {
  console.log(chunk);
}
