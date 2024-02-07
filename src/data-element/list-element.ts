import { CborDataItem } from "./cbor-data-item";
import { CborEncoder } from "./cbor-encoder";

export class ListElement extends CborDataItem<CborDataItem[]> {
    
    constructor(value: CborDataItem[] = []) {
        super(value, new CborDataItem.Attribute(CborDataItem.Type.list));
    }
    
    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }

    

}