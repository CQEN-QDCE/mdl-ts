import { CborDataItem2 } from "./cbor-data-item2";

export class DateTimeElement extends CborDataItem2<Date> {

    constructor(value: Date, subType: CborDataItem2.DateTimeMode = CborDataItem2.DateTimeMode.tdate) {
        super(value, new CborDataItem2.DatetimeAttribute(subType));
    }

}