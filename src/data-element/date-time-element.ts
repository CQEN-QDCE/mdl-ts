import { CborDataItem } from "./cbor-data-item";

export class DateTimeElement extends CborDataItem {

    constructor(private value: Date, subType: CborDataItem.DateTimeMode = CborDataItem.DateTimeMode.tdate) {
        super(new CborDataItem.DatetimeAttribute(subType));
    }

    public getValue(): Date {
        return this.value;
    }

}