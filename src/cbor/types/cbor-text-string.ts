import { CborDataItem } from "../cbor-data-item";

export class CborTextString extends CborDataItem {

    constructor(private value: string) {
        super(new CborDataItem.Attribute(CborDataItem.Type.textString));
    }
    
    public getValue(): string {
        return this.value;
    }

}