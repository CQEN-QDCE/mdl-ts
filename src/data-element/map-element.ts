import { CborDataItem } from "../cbor/cbor-data-item";
import { MapKey } from "./map-key";

export class MapElement extends CborDataItem {

    constructor(private value: Map<MapKey, CborDataItem>) {
        super(new CborDataItem.Attribute(CborDataItem.Type.map));
    }

    get(mapKey: MapKey): CborDataItem {
        for (const [key, value] of this.value) {
            if (key.str === mapKey.str) return value;
        }
        return null;
    }

    public getValue(): Map<MapKey, CborDataItem> {
        return this.value;
    }

}