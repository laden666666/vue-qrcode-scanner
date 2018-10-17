// 对java一些异常的封装和zxing自定义异常的封装
export default class Exception {

    public static IllegalArgumentException = 'IllegalArgumentException';
    public static NotFoundException = 'NotFoundException';
    public static ArithmeticException = 'ArithmeticException';
    public static FormatException = 'FormatException';
    // checksum是一种校验算法，这是校验出错时抛出的异常
    public static ChecksumException = 'ChecksumException';
    public static WriterException = 'WriterException';
    public static IllegalStateException = 'IllegalStateException';
    public static UnsupportedOperationException = 'UnsupportedOperationException';
    // reed Solomon算法（简称RS），可利用利用算法来恢复错误的数据，这是该算法出错时抛出的异常
    public static ReedSolomonException = 'ReedSolomonException';
    public static ArgumentException = 'ArgumentException';
    public static ReaderException = 'ReaderException';

    public constructor(private type: string, private message?: string) { }

    public getType(): string {
        return this.type;
    }

    public getMessage(): string | undefined {
        return this.message;
    }

    public static isOfType(ex: any, type: string): boolean {
        return ex.type === type;
    }
}
