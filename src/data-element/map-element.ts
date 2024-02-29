import { CborDataItem } from "../cbor/cbor-data-item";
import { MapKey } from "./map-key";

export class MapElement implements CborDataItem {

    constructor(private value: Map<MapKey, CborDataItem>) {
    }
    
    majorType: number;

    get(mapKey: MapKey): CborDataItem {
        for (const [key, value] of this.value) {
            if (key.str === mapKey.str) return value;
        }
        return null;
    }

    get type(): CborDataItem.Type {
        return new CborDataItem.Attribute(CborDataItem.Type.map).type;
    }

    public getValue(): Map<MapKey, CborDataItem> {
        return this.value;
    }

}