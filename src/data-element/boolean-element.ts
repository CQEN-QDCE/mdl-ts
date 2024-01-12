import { DataElement } from "./data-element";
import { DataElementSerializer } from "./data-element-serializer";

export class BooleanElement extends DataElement<boolean> {

    constructor(value: boolean) {
        super(value, new DataElement.Attribute(DataElement.Type.boolean));
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }
    
}