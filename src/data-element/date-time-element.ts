import { DataElement } from "./data-element";
import { DataElementSerializer } from './data-element-serializer';

export class DateTimeElement extends DataElement<Date> {

    constructor(value: Date, subType: DataElement.DateTimeMode = DataElement.DateTimeMode.tdate) {
        super(value, new DataElement.DatetimeAttribute(subType));
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }

}