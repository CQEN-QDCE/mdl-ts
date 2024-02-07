import { CborDataItem } from "./cbor-data-item";
import { CborEncoder } from './cbor-encoder';

export class DateTimeElement extends CborDataItem<Date> {

    constructor(value: Date, subType: CborDataItem.DateTimeMode = CborDataItem.DateTimeMode.tdate) {
        super(value, new CborDataItem.DatetimeAttribute(subType));
    }

    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }

}