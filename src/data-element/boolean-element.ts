import { CborDataItem } from "./cbor-data-item";
import { CborEncoder } from "./cbor-encoder";

export class BooleanElement extends CborDataItem<boolean> {

    constructor(value: boolean) {
        super(value, new CborDataItem.Attribute(CborDataItem.Type.boolean));
    }

    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }
    
}