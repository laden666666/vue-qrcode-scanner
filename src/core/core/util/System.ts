export default class System {
    // public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)
    // 将数组src（类数组）src从srcPos位开始length个的数据copy到数组（类数组）dest的destPos位及其后面
    public static arraycopy(src: any, srcPos: number, dest: any, destPos: number, length: number) {
        // TODO: better use split or set?
        let i = srcPos;
        let j = destPos;
        let c = length;
        while (c--) {
            dest[j++] = src[i++];
        }
    }

    // 获取当前时间戳
    public static currentTimeMillis() {
        return Date.now();
    }
}
