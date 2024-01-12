import { DataElement } from "./data-element";
import { DataElementSerializer } from "./data-element-serializer";

export class NumberElement extends DataElement<number> {

    constructor(value: number) {
        super(value, new DataElement.Attribute(DataElement.Type.number));
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }
    
}