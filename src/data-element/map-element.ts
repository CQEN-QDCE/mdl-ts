import { CborDataItem } from "./cbor-data-item";
import { MapKey } from "./map-key";
import { CborEncoder } from "./cbor-encoder";

export class MapElement extends CborDataItem<Map<MapKey, CborDataItem>> {

    constructor(value: Map<MapKey, CborDataItem>) {
        super(value, new CborDataItem.Attribute(CborDataItem.Type.map));
    }

    get(mapKey: MapKey): CborDataItem {
        for (const [key, value] of this._value) {
            if (key.str === mapKey.str) return value;
        }
        return null;
    }

    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(this);
    }

}