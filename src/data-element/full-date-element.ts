import { CborDataItem } from "./cbor-data-item";
import { CborEncoder } from "./cbor-encoder";

export class FullDateElement extends CborDataItem<Date> {

    constructor(value: Date, subType: CborDataItem.FullDateMode = CborDataItem.FullDateMode.full_date_str) {
        super(value, new CborDataItem.FullDateAttribute(subType));
    }

    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }
    
}