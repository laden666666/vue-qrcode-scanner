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

/*namespace com.google.zxing {*/

import LuminanceSource from './LuminanceSource';
import BitArray from './common/BitArray';
import BitMatrix from './common/BitMatrix';

/**
 * This class hierarchy provides a set of methods to convert luminance data to 1 bit data.
 * It allows the algorithm to vary polymorphically, for example allowing a very expensive
 * thresholding technique for servers and a fast one for mobile. It also permits the implementation
 * to vary, e.g. a JNI version for Android and a Java fallback version for other platforms.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 */
// 此类层次结构提供了一组将亮度数据转换为1位数据的方法。 它允许算法以多态方式变化，例如允许用于服务器的非常昂贵的阈值技术和用于移动的快速阈值技术。 它还允许实现变化，例如， 适用于Android的JNI版本和适用于其他平台的Java后备版本。
// 我理解是一个将图片转为二值图的策略类的模板，用于封装不同的二值化算法。
abstract class Binarizer {

    protected constructor(private source: LuminanceSource) { }

    public getLuminanceSource(): LuminanceSource {
        return this.source;
    }

    /**
     * Converts one row of luminance data to 1 bit data. May actually do the conversion, or return
     * cached data. Callers should assume this method is expensive and call it as seldom as possible.
     * This method is intended for decoding 1D barcodes and may choose to apply sharpening.
     * For callers which only examine one row of pixels at a time, the same BitArray should be reused
     * and passed in with each call for performance. However it is legal to keep more than one row
     * at a time if needed.
     *
     * @param y The row to fetch, which must be in [0, bitmap height)
     * @param row An optional preallocated array. If null or too small, it will be ignored.
     *            If used, the Binarizer will call BitArray.clear(). Always use the returned object.
     * @return The array of bits for this row (true means black).
     * @throws NotFoundException if row can't be binarized
     */
    // 将一行亮度数据转换为1位数据。 实际上可以进行转换，或返回缓存数据。 呼叫者应该假设这种方法很昂贵并尽可能少地称之为。 此方法用于解码1D条形码，可以选择应用锐化。 对于一次只检查一行像素的调用者，应该重复使用相同的BitArray，并在每次调用性能时传入。 但是，如果需要，一次保留多行是合法的。
    public abstract getBlackRow(y: number/*iny*/, row: BitArray): BitArray; /*throws NotFoundException*/

    /**
     * Converts a 2D array of luminance data to 1 bit data. As above, assume this method is expensive
     * and do not call it repeatedly. This method is intended for decoding 2D barcodes and may or
     * may not apply sharpening. Therefore, a row from this matrix may not be identical to one
     * fetched using getBlackRow(), so don't mix and match between them.
     *
     * @return The 2D array of bits for the image (true means black).
     * @throws NotFoundException if image can't be binarized to make a matrix
     */
    // 将亮度数据的2D数组转换为1位数据。 如上所述，假设此方法很昂贵，并且不会重复调用它。 此方法用于解码2D条形码，可能会也可能不会应用锐化。 因此，此矩阵中的一行可能与使用getBlackRow（）获取的行不同，因此不要在它们之间混合和匹配。
    public abstract getBlackMatrix(): BitMatrix; /*throws NotFoundException*/

    /**
     * Creates a new object with the same type as this Binarizer implementation, but with pristine
     * state. This is needed because Binarizer implementations may be stateful, e.g. keeping a cache
     * of 1 bit data. See Effective Java for why we can't use Java's clone() method.
     *
     * @param source The LuminanceSource this Binarizer will operate on.
     * @return A new concrete Binarizer implementation object.
     */
    public abstract createBinarizer(source: LuminanceSource): Binarizer;

    public getWidth(): number /*int*/ {
        return this.source.getWidth();
    }

    public getHeight(): number /*int*/ {
        return this.source.getHeight();
    }
}

export default Binarizer;
