import { CborDataItem2 } from "./cbor-data-item2";
import { MapKey } from "./map-key";

export class MapElement extends CborDataItem2<Map<MapKey, CborDataItem2>> {

    constructor(value: Map<MapKey, CborDataItem2>) {
        super(value, new CborDataItem2.Attribute(CborDataItem2.Type.map));
    }

    get(mapKey: MapKey): CborDataItem2 {
        for (const [key, value] of this._value) {
            if (key.str === mapKey.str) return value;
        }
        return null;
    }

}