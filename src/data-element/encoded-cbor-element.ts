import { CborDataItem2 } from "./cbor-data-item2";
import { CborDecoder } from './cbor-decoder';
import { CborEncoder } from "./cbor-encoder";

export class EncodedCBORElement extends CborDataItem2<ArrayBuffer> {
    constructor(value: ArrayBuffer) {
        super(value, new CborDataItem2.Attribute(CborDataItem2.Type.encodedCbor));
    }

    static encode(dataElement: CborDataItem2): EncodedCBORElement {
        return new EncodedCBORElement(CborEncoder.encode(dataElement));
    }

    decode(): CborDataItem2 {
        return CborDecoder.decode(this._value);
    }
    
}