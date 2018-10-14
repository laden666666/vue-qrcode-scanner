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

import BitMatrix from './BitMatrix';
import PerspectiveTransform from './PerspectiveTransform';
import Exception from './../Exception';

/**
 * Implementations of this class can, given locations of finder patterns for a QR code in an
 * image, sample the right points in the image to reconstruct the QR code, accounting for
 * perspective distortion. It is abstracted since it is relatively expensive and should be allowed
 * to take advantage of platform-specific optimized implementations, like Sun's Java Advanced
 * Imaging library, but which may not be available in other environments such as J2ME, and vice
 * versa.
 *
 * The implementation used can be controlled by calling {@link #setGridSampler(GridSampler)}
 * with an instance of a class which implements this interface.
 *
 * @author Sean Owen
 */

/*
*给定图像中QR码的取景器图案的位置，该类的实现可以对图像中的正确点进行采样以重建QR码，从而解决透视失真。 它是抽象的，因为它相对昂贵，应该被允许利用特定于平台的优化实现，如Sun的Java高级成像库，但在其他环境（如J2ME）中可能无法使用，反之亦然。

*可以通过调用{@link #setGridSampler（GridSampler）}来控制所使用的实现
*使用实现此接口的类的实例。
*/
abstract class GridSampler {

    /**
     * Samples an image for a rectangular matrix of bits of the given dimension. The sampling
     * transformation is determined by the coordinates of 4 points, in the original and transformed
     * image space.
     *
     * @param image image to sample
     * @param dimensionX width of {@link BitMatrix} to sample from image
     * @param dimensionY height of {@link BitMatrix} to sample from image
     * @param p1ToX point 1 preimage X
     * @param p1ToY point 1 preimage Y
     * @param p2ToX point 2 preimage X
     * @param p2ToY point 2 preimage Y
     * @param p3ToX point 3 preimage X
     * @param p3ToY point 3 preimage Y
     * @param p4ToX point 4 preimage X
     * @param p4ToY point 4 preimage Y
     * @param p1FromX point 1 image X
     * @param p1FromY point 1 image Y
     * @param p2FromX point 2 image X
     * @param p2FromY point 2 image Y
     * @param p3FromX point 3 image X
     * @param p3FromY point 3 image Y
     * @param p4FromX point 4 image X
     * @param p4FromY point 4 image Y
     *
     * 表示在由“from”参数定义的区域内从图像中采样的点网格
     * @return {@link BitMatrix} representing a grid of points sampled from the image within a region
     *   defined by the "from" parameters
     *
     * 如果无法对图像进行采样，例如，如果给定点定义的变换无效或导致图像边界外的采样
     * @throws NotFoundException if image can't be sampled, for example, if the transformation defined
     *   by the given points is invalid or results in sampling outside the image boundaries
     */
    public abstract sampleGrid(
        image: BitMatrix,
        dimensionX: number /*int*/,
        dimensionY: number /*int*/,
        p1ToX: number/*float*/, p1ToY: number/*float*/,
        p2ToX: number/*float*/, p2ToY: number/*float*/,
        p3ToX: number/*float*/, p3ToY: number/*float*/,
        p4ToX: number/*float*/, p4ToY: number/*float*/,
        p1FromX: number/*float*/, p1FromY: number/*float*/,
        p2FromX: number/*float*/, p2FromY: number/*float*/,
        p3FromX: number/*float*/, p3FromY: number/*float*/,
        p4FromX: number/*float*/, p4FromY: number/*float*/
    ): BitMatrix; /*throws NotFoundException*/

    public abstract sampleGridWithTransform(
        image: BitMatrix,
        dimensionX: number /*int*/,
        dimensionY: number /*int*/,
        transform: PerspectiveTransform
    ): BitMatrix; /*throws NotFoundException*/

    /**
     * <p>Checks a set of points that have been transformed to sample points on an image against
     * the image's dimensions to see if the point are even within the image.</p>
     *
     * <p>This method will actually "nudge" the endpoints back onto the image if they are found to be
     * barely (less than 1 pixel) off the image. This accounts for imperfect detection of finder
     * patterns in an image where the QR Code runs all the way to the image border.</p>
     *
     * <p>For efficiency, the method will check points from either end of the line until one is found
     * to be within the image. Because the set of points are assumed to be linear, this is valid.</p>
     *
     * @param image image into which the points should map
     * @param points actual points in x1,y1,...,xn,yn form
     * @throws NotFoundException if an endpoint is lies outside the image boundaries
     */
    /**
     *<p>根据图像的尺寸检查已转换为图像上的采样点的一组点，以查看该点是否在图像内。</ p>
     
    <p>如果发现端点距离图像不足（小于1个像素），则此方法实际上会将端点“轻推”回到图像上。 这导致QR码一直运行到图像边界的图像中的取景器图案检测不完善。</ p>
    
    <p>为了提高效率，该方法将从线的任一端检查点，直到找到一个点在图像内。 因为假设点集是线性的，所以这是有效的。</ p>
     */
    protected static checkAndNudgePoints(
        image: BitMatrix,
        points: Float32Array
    ): void /*throws NotFoundException*/ {

        const width: number /*int*/ = image.getWidth();
        const height: number /*int*/ = image.getHeight();

        // Check and nudge points from start until we see some that are OK:
        let nudged: boolean = true;

        for (let offset = 0; offset < points.length && nudged; offset += 2) {

            const x = Math.floor(points[offset]);
            const y = Math.floor(points[offset + 1]);

            if (x < -1 || x > width || y < -1 || y > height) {
                throw new Exception(Exception.NotFoundException);
            }

            nudged = false;

            if (x === -1) {
                points[offset] = 0.0;
                nudged = true;
            } else if (x === width) {
                points[offset] = width - 1;
                nudged = true;
            }

            if (y === -1) {
                points[offset + 1] = 0.0;
                nudged = true;
            } else if (y === height) {
                points[offset + 1] = height - 1;
                nudged = true;
            }
        }

        // Check and nudge points from end:
        nudged = true;

        for (let offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {

            const x = Math.floor(points[offset]);
            const y = Math.floor(points[offset + 1]);

            if (x < -1 || x > width || y < -1 || y > height) {
                throw new Exception(Exception.NotFoundException);
            }

            nudged = false;

            if (x === -1) {
                points[offset] = 0.0;
                nudged = true;
            } else if (x === width) {
                points[offset] = width - 1;
                nudged = true;
            }

            if (y === -1) {
                points[offset + 1] = 0.0;
                nudged = true;
            } else if (y === height) {
                points[offset + 1] = height - 1;
                nudged = true;
            }
        }
    }

}

export default GridSampler;
