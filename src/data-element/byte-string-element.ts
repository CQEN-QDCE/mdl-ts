import { CborDataItem } from "./cbor-data-item";
import { CborEncoder } from './cbor-encoder';

export class ByteStringElement extends CborDataItem<ArrayBuffer> {
    
    constructor(value: ArrayBuffer) {
        super(value, new CborDataItem.Attribute(CborDataItem.Type.byteString));
    }
    
    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }
    
}