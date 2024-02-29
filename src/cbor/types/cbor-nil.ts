import { CborDataItem } from "../cbor-data-item";

export class CborNil extends CborDataItem {
    
    private readonly value: null = null;

    constructor() {
        super(new CborDataItem.Attribute(CborDataItem.Type.nil));
    }
    
    public getValue(): null {
        return this.value;
    }

}