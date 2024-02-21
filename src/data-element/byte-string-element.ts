import { CborDataItem2 } from "./cbor-data-item2";

export class ByteStringElement extends CborDataItem2<ArrayBuffer> {
    
    constructor(value: ArrayBuffer) {
        super(value, new CborDataItem2.Attribute(CborDataItem2.Type.byteString));
    }
    
}