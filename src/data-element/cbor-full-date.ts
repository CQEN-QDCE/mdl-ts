import { CborDataItem } from "./cbor-data-item";

export class CborFullDate extends CborDataItem {

    constructor(private value: Date, mode: CborDataItem.FullDateMode = CborDataItem.FullDateMode.string) {
        super(new CborDataItem.FullDateAttribute(mode));
    }
    
    public getValue(): Date {
        return this.value;
    }

}