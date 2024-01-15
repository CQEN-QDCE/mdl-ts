export interface CborCodec {

    encode(...objs: any[]): ArrayBuffer;

    decode(value: ArrayBuffer): any;
    
}