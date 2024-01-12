import { DataElement } from "./data-element";
import { DataElementSerializer } from "./data-element-serializer";

export class FullDateElement extends DataElement<Date> {

    constructor(value: Date, subType: DataElement.FullDateMode = DataElement.FullDateMode.full_date_str) {
        super(value, new DataElement.FullDateAttribute(subType));
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }
    
}