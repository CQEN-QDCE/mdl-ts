import { CborDataItem } from "../cbor/cbor-data-item";
import { CborEncoder } from "../cbor/cbor-encoder";

export class CborEncodedDataItem extends CborDataItem {
    
    constructor(private value: ArrayBuffer) {
        super(new CborDataItem.Attribute(CborDataItem.Type.encodedCbor));
    }

    static encode(dataElement: CborDataItem): CborEncodedDataItem {
        return new CborEncodedDataItem(CborEncoder.encode(dataElement));
    }

    public getValue(): ArrayBuffer {
        return this.value;
    }
    
}