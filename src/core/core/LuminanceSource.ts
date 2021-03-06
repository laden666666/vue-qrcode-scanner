/*
 * Copyright 2009 ZXing authors
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

import Exception from './Exception';
import InvertedLuminanceSource from './InvertedLuminanceSource';
import StringBuilder from './util/StringBuilder';

/*namespace com.google.zxing {*/

/**
 * The purpose of this class hierarchy is to abstract different bitmap implementations across
 * platforms into a standard interface for requesting greyscale luminance values. The interface
 * only provides immutable methods; therefore crop and rotation create copies. This is to ensure
 * that one Reader does not modify the original luminance source and leave it in an unknown state
 * for other Readers in the chain.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 */
// 此类层次结构的目的是将跨平台的不同位图实现抽象为用于请求灰度亮度值的标准接口。 该接口仅提供不可变的方法; 因此裁剪和旋转会创建副本。 这是为了确保一个Reader不会修改原始亮度源，并使链中的其他读取器处于未知状态。
abstract class LuminanceSource {

    protected constructor(private width: number /*int*/, private height: number /*int*/) { }

    /**
     * Fetches one row of luminance data from the underlying platform's bitmap. Values range from
     * 0 (black) to 255 (white). Because Java does not have an unsigned byte type, callers will have
     * to bitwise and with 0xff for each value. It is preferable for implementations of this method
     * to only fetch this row rather than the whole image, since no 2D Readers may be installed and
     * getMatrix() may never be called.
     *
     * @param y The row to fetch, which must be in [0,getHeight())
     * @param row An optional preallocated array. If null or too small, it will be ignored.
     *            Always use the returned object, and ignore the .length of the array.
     * @return An array containing the luminance data.
     */
    // 从底层平台的位图获取一行亮度数据。 值范围从0（黑色）到255（白色）。 因为Java没有无符号字节类型，所以调用者必须按位并且每个值都使用0xff。 优选地，该方法的实现仅获取该行而不是整个图像，因为可以不安装2D读取器并且可能永远不会调用getMatrix（）。
    public abstract getRow(y: number /*int*/, row?: Uint8ClampedArray): Uint8ClampedArray;

    /**
     * Fetches luminance data for the underlying bitmap. Values should be fetched using:
     * {@code int luminance = array[y * width + x] & 0xff}
     *
     * @return A row-major 2D array of luminance values. Do not use result.length as it may be
     *         larger than width * height bytes on some platforms. Do not modify the contents
     *         of the result.
     */
    public abstract getMatrix(): Uint8ClampedArray;

    /**
     * @return The width of the bitmap.
     */
    public getWidth(): number /*int*/ {
        return this.width;
    }

    /**
     * @return The height of the bitmap.
     */
    public getHeight(): number /*int*/ {
        return this.height;
    }

    /**
     * @return Whether this subclass supports cropping.
     */
    public isCropSupported(): boolean {
        return false;
    }

    /**
     * Returns a new object with cropped image data. Implementations may keep a reference to the
     * original data rather than a copy. Only callable if isCropSupported() is true.
     *
     * @param left The left coordinate, which must be in [0,getWidth())
     * @param top The top coordinate, which must be in [0,getHeight())
     * @param width The width of the rectangle to crop.
     * @param height The height of the rectangle to crop.
     * @return A cropped version of this object.
     */
    public crop(left: number /*int*/, top: number /*int*/, width: number /*int*/, height: number /*int*/): LuminanceSource {
        throw new Exception(Exception.UnsupportedOperationException, 'This luminance source does not support cropping.');
    }

    /**
     * @return Whether this subclass supports counter-clockwise rotation.
     */
    public isRotateSupported(): boolean {
        return false;
    }

    /**
     * @return a wrapper of this {@code LuminanceSource} which inverts the luminances it returns -- black becomes
     *  white and vice versa, and each value becomes (255-value).
     */
    public abstract invert(): LuminanceSource;

    /**
     * Returns a new object with rotated image data by 90 degrees counterclockwise.
     * Only callable if {@link #isRotateSupported()} is true.
     *
     * @return A rotated version of this object.
     */
    public rotateCounterClockwise(): LuminanceSource {
        throw new Exception(Exception.UnsupportedOperationException, 'This luminance source does not support rotation by 90 degrees.');
    }

    /**
     * Returns a new object with rotated image data by 45 degrees counterclockwise.
     * Only callable if {@link #isRotateSupported()} is true.
     *
     * @return A rotated version of this object.
     */
    public rotateCounterClockwise45(): LuminanceSource {
        throw new Exception(Exception.UnsupportedOperationException, 'This luminance source does not support rotation by 45 degrees.');
    }

    /*@Override*/
    public toString(): string {
        const row = new Uint8ClampedArray(this.width);
        let result = new StringBuilder();
        for (let y = 0; y < this.height; y++) {
            const sourceRow = this.getRow(y, row);
            for (let x = 0; x < this.width; x++) {
                const luminance = sourceRow[x] & 0xFF;
                let c;
                if (luminance < 0x40) {
                    c = '#';
                } else if (luminance < 0x80) {
                    c = '+';
                } else if (luminance < 0xC0) {
                    c = '.';
                } else {
                    c = ' ';
                }
                result.append(c);
            }
            result.append('\n');
        }
        return result.toString();
    }

}

export default LuminanceSource;
