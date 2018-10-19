import GridSampler from './GridSampler';
import DefaultGridSampler from './DefaultGridSampler';

// 一个采样器的单例，同时可以注册不同算法的采样器
export default class GridSamplerInstance {

    private static gridSampler: GridSampler = new DefaultGridSampler();

    /**
     * Sets the implementation of GridSampler used by the library. One global
     * instance is stored, which may sound problematic. But, the implementation provided
     * ought to be appropriate for the entire platform, and all uses of this library
     * in the whole lifetime of the JVM. For instance, an Android activity can swap in
     * an implementation that takes advantage of native platform libraries.
     *
     * @param newGridSampler The platform-specific object to install.
     */
    // 设置库使用的GridSampler的实现。 存储一个全局实例，这可能听起来有问题。 但是，提供的实现应该适用于整个平台，以及在JVM的整个生命周期中对此库的所有使用。 例如，Android活动可以交换利用本机平台库的实现。
    // 因为本项目仅适用于浏览器中运行，这个类有重构的空间
    public static setGridSampler(newGridSampler: GridSampler): void {
        GridSamplerInstance.gridSampler = newGridSampler;
    }

    /**
     * @return the current implementation of GridSampler
     */
    public static getInstance(): GridSampler {
        return GridSamplerInstance.gridSampler;
    }

}
