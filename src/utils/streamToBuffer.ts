import {Readable} from 'stream';

export function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => {
      chunks.push(Buffer.from(chunk));
    });
    stream.on('error', err => {
      reject(err);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
