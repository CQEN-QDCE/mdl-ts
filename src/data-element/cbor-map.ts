import { CborDataItem } from "../cbor/cbor-data-item";
import { MapKey } from "./map-key";

export class CborMap implements CborDataItem {

    majorType: number;

    constructor(private value: Map<MapKey, CborDataItem>) {
    }
    
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