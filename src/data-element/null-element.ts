import { CborDataItem } from "./cbor-data-item";
import { CborEncoder } from './cbor-encoder';

export class NullElement extends CborDataItem<null> {

    constructor() {
        super(null, new CborDataItem.Attribute(CborDataItem.Type.nil));
    }
    
    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }
    
}