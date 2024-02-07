import { CborDataItem } from "./cbor-data-item";
import { CborDecoder } from './cbor-decoder';
import { CborEncoder } from "./cbor-encoder";

export class EncodedCBORElement extends CborDataItem<ArrayBuffer> {
    constructor(value: ArrayBuffer) {
        super(value, new CborDataItem.Attribute(CborDataItem.Type.encodedCbor));
    }

    static encode(dataElement: CborDataItem): EncodedCBORElement {
        return new EncodedCBORElement(CborEncoder.encode(dataElement));
    }

    decode(): CborDataItem {
        return CborDecoder.decode(this._value);
    }

    toCBOR(): Buffer {
        return Buffer.from(this._value);
    }
    
}