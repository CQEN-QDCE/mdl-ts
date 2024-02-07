import { CborDataItem } from "./cbor-data-item";
import { CborEncoder } from "./cbor-encoder";

export class StringElement extends CborDataItem<string> {

    constructor(value: string) {
        super(value, new CborDataItem.Attribute(CborDataItem.Type.textString));
    }

    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }
    
}