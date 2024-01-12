import { DataElement } from "./data-element";
import { DataElementSerializer } from "./data-element-serializer";
import { DateTimeElement } from "./date-time-element";

export class TDateElement extends DateTimeElement {

    constructor(value: Date) {
        super(value, DataElement.DateTimeMode.tdate);
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }
    
}