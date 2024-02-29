import { CborDataItem } from "../cbor/cbor-data-item";
import { CborMap } from "../data-element/cbor-map";
import { MapKey } from "../data-element/map-key";
import { CborTextString } from "../cbor/types/cbor-text-string";

export class ItemsRequest {

    public readonly docType: string;
    
    // Requested data elements for each namespace.
    public readonly namespaces: CborMap;

    constructor(docType: string, 
                nameSpaces: CborMap) {
        this.docType = docType;
        this.namespaces = nameSpaces;
    }

    static fromMapElement(mapElement: CborMap): ItemsRequest {
        const docType = <CborTextString>mapElement.get(new MapKey('docType'));
        const nameSpaces = <CborMap>mapElement.get(new MapKey('nameSpaces'));
        return new ItemsRequest(docType.getValue(), nameSpaces);
    }

    toMapElement(): CborMap {
        const map = new Map<MapKey, CborDataItem>();
        map.set(new MapKey('docType'), new CborTextString(this.docType));
        map.set(new MapKey('nameSpaces'), this.namespaces);
        return new CborMap(map);
    }
}