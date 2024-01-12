import { DataElement } from "./data-element";
import { MapKey } from "./map-key";
import { DataElementSerializer } from "./data-element-serializer";

export class MapElement extends DataElement<Map<MapKey, DataElement>> {

    constructor(value: Map<MapKey, DataElement>) {
        super(value, new DataElement.Attribute(DataElement.Type.map));
    }

    get(mapKey: MapKey): DataElement {
        for (const [key, value] of this._value) {
            if (key.str === mapKey.str) return value;
        }
        return null;
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this);
    }

}