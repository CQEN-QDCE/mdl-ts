import { CborDataItem2 } from "./cbor-data-item2";

export class FullDateElement extends CborDataItem2<Date> {

    constructor(value: Date, subType: CborDataItem2.FullDateMode = CborDataItem2.FullDateMode.full_date_str) {
        super(value, new CborDataItem2.FullDateAttribute(subType));
    }
    
}