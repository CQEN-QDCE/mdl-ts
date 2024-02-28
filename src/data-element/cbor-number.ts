import { CborDataItem } from "./cbor-data-item";

export class CborNumber extends CborDataItem {

    constructor(private value: number) {
        super(new CborDataItem.Attribute(CborDataItem.Type.number));
    }
    
    public getValue(): number {
        return this.value;
    }

}