import { DataElement } from "./data-element";
import { DataElementSerializer } from './data-element-serializer';

export class ByteStringElement extends DataElement<ArrayBuffer> {
    
    constructor(value: ArrayBuffer) {
        super(value, new DataElement.Attribute(DataElement.Type.byteString));
    }
    
    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }
    
}