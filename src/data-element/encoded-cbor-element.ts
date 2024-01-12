import { DataElement } from "./data-element";
import { DataElementDeserializer } from './data-element-deserializer';
import { DataElementSerializer } from "./data-element-serializer";

export class EncodedCBORElement extends DataElement<ArrayBuffer> {
    constructor(value: ArrayBuffer) {
        super(value, new DataElement.Attribute(DataElement.Type.encodedCbor));
    }

    static encode(dataElement: DataElement): EncodedCBORElement {
        return new EncodedCBORElement(DataElementSerializer.toCBOR(dataElement));
    }

    decode(): DataElement {
        return DataElementDeserializer.fromCBOR(this._value);
    }

    toCBOR(): Buffer {
        return Buffer.from(this._value);
    }
    
}