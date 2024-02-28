import { CborDataItem } from "../cbor-data-item";

export class CborBoolean extends CborDataItem implements Boolean {

    constructor(private value: boolean) {
        super(new CborDataItem.Attribute(CborDataItem.Type.boolean));
    }

    valueOf(): boolean {
        return this.value;
    }

    public getValue(): boolean {
        return this.value;
    }
    
}

