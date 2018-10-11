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

/**
 * <p>This class implements a perspective transform in two dimensions. Given four source and four
 * destination points, it will compute the transformation implied between them. The code is based
 * directly upon section 3.4.2 of George Wolberg's "Digital Image Warping"; see pages 54-56.</p>
 *
 * @author Sean Owen
 */
// 图像处理中的透视变换。opencv也有这样的代码
// https://blog.csdn.net/xiaowei_cqu/article/details/26471527
// https://blog.csdn.net/weixin_41676170/article/details/82848076
// http://m.elecfans.com/article/593459.html
export default class PerspectiveTransform {

    // 二维图像透视变换。a11 a21...是变换的矩阵的系数
    private constructor(private a11: number/*float*/, private a21: number/*float*/, private a31: number/*float*/,
        private a12: number/*float*/, private a22: number/*float*/, private a32: number/*float*/,
        private a13: number/*float*/, private a23: number/*float*/, private a33: number/*float*/) { }

    // 根据两个不同平面的两个四边形，获得转换矩阵
    public static quadrilateralToQuadrilateral(
        x0: number/*float*/, y0: number/*float*/,
        x1: number/*float*/, y1: number/*float*/,
        x2: number/*float*/, y2: number/*float*/,
        x3: number/*float*/, y3: number/*float*/,
        x0p: number/*float*/, y0p: number/*float*/,
        x1p: number/*float*/, y1p: number/*float*/,
        x2p: number/*float*/, y2p: number/*float*/,
        x3p: number/*float*/, y3p: number/*float*/
    ): PerspectiveTransform {

        const qToS = PerspectiveTransform.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
        const sToQ = PerspectiveTransform.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
        // 我们通过两次变换：四边形变换到正方形+正方形变换到四边形就可以将任意一个四边形变换到另一个四边形的变换矩阵。
        return sToQ.times(qToS);
    }

    //对点进行变换。points是一个点数组，奇数位是横坐标 偶数位是列坐标
    public transformPoints(points: Float32Array): void {

        const max = points.length;

        const a11 = this.a11;
        const a12 = this.a12;
        const a13 = this.a13;
        const a21 = this.a21;
        const a22 = this.a22;
        const a23 = this.a23;
        const a31 = this.a31;
        const a32 = this.a32;
        const a33 = this.a33;

        for (let i = 0; i < max; i += 2) {
            const x = points[i];
            const y = points[i + 1];
            const denominator = a13 * x + a23 * y + a33;
            points[i] = (a11 * x + a21 * y + a31) / denominator;
            points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
        }
    }

    // 另一种的点的透视变换，xValues和yValues分别是点的x、y的数组
    public transformPointsWithValues(xValues: Float32Array, yValues: Float32Array): void {

        const a11 = this.a11;
        const a12 = this.a12;
        const a13 = this.a13;
        const a21 = this.a21;
        const a22 = this.a22;
        const a23 = this.a23;
        const a31 = this.a31;
        const a32 = this.a32;
        const a33 = this.a33;

        const n = xValues.length;

        for (let i = 0; i < n; i++) {
            const x = xValues[i];
            const y = yValues[i];
            const denominator = a13 * x + a23 * y + a33;

            xValues[i] = (a11 * x + a21 * y + a31) / denominator;
            yValues[i] = (a12 * x + a22 * y + a32) / denominator;
        }
    }

    // 对矩形变换，转为四边形
    // 需要四个点，由这4个点可以推导出a11 a12 ...等几个参数。这些参数就是变换矩阵
    public static squareToQuadrilateral(
        x0: number/*float*/, y0: number/*float*/,
        x1: number/*float*/, y1: number/*float*/,
        x2: number/*float*/, y2: number/*float*/,
        x3: number/*float*/, y3: number/*float*/
    ): PerspectiveTransform {

        // http://m.elecfans.com/article/593459.html
        // 求解出的变换矩阵就可以将一个正方形变换到四边形。反之，四边形变换到正方形也是一样的。

        const dx3 = x0 - x1 + x2 - x3;
        const dy3 = y0 - y1 + y2 - y3;

        if (dx3 === 0.0 && dy3 === 0.0) {
            //
            // Affine 仿射变换？？
            return new PerspectiveTransform(x1 - x0, x2 - x1, x0,
                y1 - y0, y2 - y1, y0,
                0.0, 0.0, 1.0);
        } else {
            const dx1 = x1 - x2;
            const dx2 = x3 - x2;
            const dy1 = y1 - y2;
            const dy2 = y3 - y2;

            const denominator = dx1 * dy2 - dx2 * dy1;

            const a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
            const a23 = (dx1 * dy3 - dx3 * dy1) / denominator;

            return new PerspectiveTransform(
                x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0,
                y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0,
                a13, a23, 1.0
            );
        }
    }

    // 把四边形抓到矩形，就是上一个过程的逆运算，所以求转换矩阵的伴随矩阵
    public static quadrilateralToSquare(
        x0: number/*float*/, y0: number/*float*/,
        x1: number/*float*/, y1: number/*float*/,
        x2: number/*float*/, y2: number/*float*/,
        x3: number/*float*/, y3: number/*float*/
    ): PerspectiveTransform {
        // Here, the adjoint serves as the inverse:
        return PerspectiveTransform.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
    }

    // 构建伴随矩阵
    protected buildAdjoint(): PerspectiveTransform {
        // Adjoint is the transpose of the cofactor matrix:
        return new PerspectiveTransform(
            this.a22 * this.a33 - this.a23 * this.a32,
            this.a23 * this.a31 - this.a21 * this.a33,
            this.a21 * this.a32 - this.a22 * this.a31,
            this.a13 * this.a32 - this.a12 * this.a33,
            this.a11 * this.a33 - this.a13 * this.a31,
            this.a12 * this.a31 - this.a11 * this.a32,
            this.a12 * this.a23 - this.a13 * this.a22,
            this.a13 * this.a21 - this.a11 * this.a23,
            this.a11 * this.a22 - this.a12 * this.a21
        );
    }

    // 当进行多次变换时，就是多个变换矩阵相乘，得到一个新矩阵
    protected times(other: PerspectiveTransform): PerspectiveTransform {
        return new PerspectiveTransform(
            this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13,
            this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23,
            this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33,
            this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13,
            this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23,
            this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33,
            this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13,
            this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23,
            this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33
        );
    }

}
