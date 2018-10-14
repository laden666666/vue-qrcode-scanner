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

import GridSampler from './GridSampler';
import BitMatrix from './BitMatrix';
import PerspectiveTransform from './PerspectiveTransform';
import Exception from './../Exception';

/**
 * @author Sean Owen
 */
// 默认网格采样器??
export default class DefaultGridSampler extends GridSampler {

    /*@Override*/
    public sampleGrid(
        // 要变换的图片
        image: BitMatrix,
        // 输出图片的宽度
        dimensionX: number /*int*/,
        // 输出图片的高度
        dimensionY: number /*int*/,
        // 原4四边形的坐标
        p1ToX: number/*float*/, p1ToY: number/*float*/,
        p2ToX: number/*float*/, p2ToY: number/*float*/,
        p3ToX: number/*float*/, p3ToY: number/*float*/,
        p4ToX: number/*float*/, p4ToY: number/*float*/,
        // 目标平面四边形坐标
        p1FromX: number/*float*/, p1FromY: number/*float*/,
        p2FromX: number/*float*/, p2FromY: number/*float*/,
        p3FromX: number/*float*/, p3FromY: number/*float*/,
        p4FromX: number/*float*/, p4FromY: number/*float*/): BitMatrix /*throws NotFoundException*/ {

        // 生成透视变换的对象
        const transform = PerspectiveTransform.quadrilateralToQuadrilateral(
            p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY,
            p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY);

        return this.sampleGridWithTransform(image, dimensionX, dimensionY, transform);
    }

    /*@Override*/
    public sampleGridWithTransform(image: BitMatrix,
        dimensionX: number /*int*/,
        dimensionY: number /*int*/,
        transform: PerspectiveTransform): BitMatrix /*throws NotFoundException*/ {
        if (dimensionX <= 0 || dimensionY <= 0) {
            throw new Exception(Exception.NotFoundException);
        }

        // 创建输出的图片
        const bits = new BitMatrix(dimensionX, dimensionY);
        // 做一个数组，数组长度n是宽的2倍，这样0，2，3...2n位分别是x1,x2,x3....xn；1，3，4...2n + 1位分别是y1,y2,y3....yn
        const points = new Float32Array(2 * dimensionX);
        for (let y = 0; y < dimensionY; y++) {
            const max = points.length;
            // +0.5????????
            const iValue: number /*float*/ = y + 0.5;
            for (let x = 0; x < max; x += 2) {
                points[x] = /*(float)*/ (x / 2) + 0.5;
                points[x + 1] = iValue;
            }
            transform.transformPoints(points);
            // Quick check to see if points transformed to something inside the image
            // sufficient to check the endpoints
            GridSampler.checkAndNudgePoints(image, points);
            try {
                for (let x = 0; x < max; x += 2) {
                    if (image.get(Math.floor(points[x]), Math.floor(points[x + 1]))) {
                        // Black(-ish) pixel
                        bits.set(x / 2, y);
                    }
                }
            } catch (aioobe/*: ArrayIndexOutOfBoundsException*/) {
                // This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
                // transform gets "twisted" such that it maps a straight line of points to a set of points
                // whose endpoints are in bounds, but others are not. There is probably some mathematical
                // way to detect this about the transformation that I don't know yet.
                // This results in an ugly runtime exception despite our clever checks above -- can't have
                // that. We could check each point's coordinates but that feels duplicative. We settle for
                // catching and wrapping ArrayIndexOutOfBoundsException.
                throw new Exception(Exception.NotFoundException);
            }
        }
        return bits;
    }

}
