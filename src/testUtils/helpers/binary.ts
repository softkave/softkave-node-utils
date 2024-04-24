import assert from 'assert';
import {Readable} from 'stream';
import {streamToBuffer} from '../../utils/streamToBuffer';

export async function expectBinaryEqual(
  body: Buffer | Readable,
  expectedBody: Buffer | Readable
) {
  const [bodyBuffer, expectedBuffer] = await Promise.all([
    Buffer.isBuffer(body) ? body : streamToBuffer(body),
    Buffer.isBuffer(expectedBody) ? expectedBody : streamToBuffer(expectedBody),
  ]);

  assert(bodyBuffer);
  assert(expectedBuffer);
  expect(expectedBuffer.equals(bodyBuffer)).toBe(true);
}
