/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*namespace com.google.zxing.common {*/

import Exception from './../Exception';

/**
 * <p>This provides an easy abstraction to read bits at a time from a sequence of bytes, where the
 * number of bits read is not often a multiple of 8.</p>
 *
 * <p>This class is thread-safe but not reentrant -- unless the caller modifies the bytes array
 * it passed in, in which case all bets are off.</p>
 *
 * @author Sean Owen
 */

// 这提供了从字节序列中一次读取位的简单抽象，其中读取的位数通常不是8的倍数。这个类是线程安全的，但不可重入 - 除非调用者修改它传入的字节数组，在这种情况下，所有的投注都关闭。
// 这应该是原封不动地抄的java的代码注释，否则不应该存在线程安全一说
export default class BitSource {

    private byteOffset: number; /*int*/
    private bitOffset: number; /*int*/

    /**
     * @param bytes bytes from which this will read bits. Bits will be read from the first byte first.
     * Bits are read within a byte from most-significant to least-significant bit.
     */
    // 用Uint8Array表示字节数组，合理。不过估计是为了对应java的btye类型而选取的
    public constructor(private bytes: Uint8Array) {
        this.byteOffset = 0;
        this.bitOffset = 0;
    }

    /**
     * @return index of next bit in current byte which would be read by the next call to {@link #readBits(int)}.
     */
    // 当前字节中下一位的索引
    public getBitOffset(): number /*int*/ {
        return this.bitOffset;
    }

    /**
     * @return index of next byte in input byte array which would be read by the next call to {@link #readBits(int)}.
     */
    // 当前字节中下一字节的索引
    public getByteOffset(): number /*int*/ {
        return this.byteOffset;
    }

    /**
     * @param numBits number of bits to read
     * @return int representing the bits read. The bits will appear as the least-significant
     *         bits of the int
     * @throws IllegalArgumentException if numBits isn't in [1,32] or more than is available
     */
    // 读接下来几位的值，一次最多可读32位，应该是因为java的int的最大长度，如果超过32位int会储存不下
    // 题外话，js的number最大程度是53位
    public readBits(numBits: number /*int*/): number /*int*/ {
        // 要读的位的值
        if (numBits < 1 || numBits > 32 || numBits > this.available()) {
            throw new Exception(Exception.IllegalArgumentException, '' + numBits);
        }

        let result = 0;

        let bitOffset = this.bitOffset;
        let byteOffset = this.byteOffset;

        const bytes = this.bytes;
        // First, read remainder from current byte
        // 先读当前字节
        if (bitOffset > 0) {
            const bitsLeft = 8 - bitOffset;
            const toRead = numBits < bitsLeft ? numBits : bitsLeft;
            const bitsToNotRead = bitsLeft - toRead;
            const mask = (0xFF >> (8 - toRead)) << bitsToNotRead;

            result = (bytes[byteOffset] & mask) >> bitsToNotRead;
            numBits -= toRead;
            bitOffset += toRead;

            if (bitOffset === 8) {
                bitOffset = 0;
                byteOffset++;
            }
        }

        // Next read whole bytes
        // 如果当前字节剩余位数不够读，再循环读剩余位
        if (numBits > 0) {
            // 如果对于8，一次读一字节
            while (numBits >= 8) {
                result = (result << 8) | (bytes[byteOffset] & 0xFF);
                byteOffset++;
                numBits -= 8;
            }

            // Finally read a partial byte
            // 不足一字节时候
            if (numBits > 0) {
                const bitsToNotRead = 8 - numBits;
                const mask = (0xFF >> bitsToNotRead) << bitsToNotRead;

                result = (result << numBits) | ((bytes[byteOffset] & mask) >> bitsToNotRead);
                bitOffset += numBits;
            }
        }

        this.bitOffset = bitOffset;
        this.byteOffset = byteOffset;

        return result;
    }

    /**
     * @return number of bits that can be read successfully
     */
    public available(): number /*int*/ {
        return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
    }

}
