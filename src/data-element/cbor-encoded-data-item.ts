import { CborDataItem } from "./cbor-data-item";
import { CborDecoder } from '../cbor/cbor-decoder';
import { CborEncoder } from "../cbor/cbor-encoder";

export class CborEncodedDataItem extends CborDataItem {
    
    constructor(private value: ArrayBuffer) {
        super(new CborDataItem.Attribute(CborDataItem.Type.encodedCbor));
    }

    static encode(dataElement: CborDataItem): CborEncodedDataItem {
        return new CborEncodedDataItem(CborEncoder.encode(dataElement));
    }

    decode(): CborDataItem {
        return CborDecoder.decode(this.value);
    }

    public getValue(): ArrayBuffer {
        return this.value;
    }
    
}