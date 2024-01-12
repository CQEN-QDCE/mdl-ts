import { DataElement } from "./data-element";
import { DataElementSerializer } from './data-element-serializer';

export class NullElement extends DataElement<null> {

    constructor() {
        super(null, new DataElement.Attribute(DataElement.Type.nil));
    }
    
    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }
    
}