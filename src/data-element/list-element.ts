import { DataElement } from "./data-element";
import { DataElementSerializer } from "./data-element-serializer";

export class ListElement extends DataElement<DataElement[]> {
    
    constructor(value: DataElement[] = []) {
        super(value, new DataElement.Attribute(DataElement.Type.list));
    }
    
    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }

    

}