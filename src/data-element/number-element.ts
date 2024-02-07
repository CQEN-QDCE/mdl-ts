import { CborDataItem } from "./cbor-data-item";
import { CborEncoder } from "./cbor-encoder";

export class NumberElement extends CborDataItem<number> {

    constructor(value: number) {
        super(value, new CborDataItem.Attribute(CborDataItem.Type.number));
    }

    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }
    
}