import { CborDataItem } from "./cbor-data-item";

export class CborByteString extends CborDataItem {
    
    constructor(private readonly value: ArrayBuffer) {
        super(new CborDataItem.Attribute(CborDataItem.Type.byteString));
    }

    public getValue(): ArrayBuffer {
        return this.value;
    }
   
}