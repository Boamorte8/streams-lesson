import { Writable } from 'stream';

class StreamConcat extends Writable {
  constructor(opts) {
    super(opts);

    this.data = '';
  }

  _write(chunk, encoding, callback) {
    console.log('_WRITE', chunk, encoding, callback);

    this.data += chunk.toString();

    callback();
  }

  /**
   * This method is needed when you use cork and uncork() methods to do the writing process in a step
   * if this methods doesn't exist the writing process will be chunk by chunk and this slow the process
   *
   * @param {*} chunkList
   * @param {*} callback
   * @memberof StreamConcat
   */
  _writev(chunkList, callback) {
    const result = chunkList.map((chunkData) => chunkData.chunk).join('');

    this.data += result;

    callback();
  }
}
/** As Readable you can pass an object with objectMode: true
 * This change the type of data that you can pass on the write method
 */
const streamConcat = new StreamConcat();

// cork() and uncork() allow us to group an amount of data to be written
// but for this you need to create _writev method to improve the performance of the writing process
// streamConcat.cork();
// streamConcat.cork();

streamConcat.write('A');
streamConcat.write('B');
streamConcat.write('C');

// Special case: if you call cork() x times you MUST call uncork() same times
// if not will not work except if you call end() function
// streamConcat.uncork();
// streamConcat.uncork();
streamConcat.end();

console.log('END', streamConcat.data);
