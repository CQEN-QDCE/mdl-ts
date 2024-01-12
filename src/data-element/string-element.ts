import { DataElement } from "./data-element";
import { DataElementSerializer } from "./data-element-serializer";

export class StringElement extends DataElement<string> {

    constructor(value: string) {
        super(value, new DataElement.Attribute(DataElement.Type.textString));
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }
    
}