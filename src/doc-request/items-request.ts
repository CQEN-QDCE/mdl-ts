import { CborDataItem2 } from "../data-element/cbor-data-item2";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { StringElement } from "../data-element/string-element";

export class ItemsRequest {

    public readonly docType: string;
    
    // Requested data elements for each namespace.
    public readonly namespaces: MapElement;

    constructor(docType: string, 
                nameSpaces: MapElement) {
        this.docType = docType;
        this.namespaces = nameSpaces;
    }

    static fromMapElement(mapElement: MapElement): ItemsRequest {
        const docType = <StringElement>mapElement.get(new MapKey('docType'));
        const nameSpaces = <MapElement>mapElement.get(new MapKey('nameSpaces'));
        return new ItemsRequest(docType.value, nameSpaces);
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, CborDataItem2>();
        map.set(new MapKey('docType'), new StringElement(this.docType));
        map.set(new MapKey('nameSpaces'), this.namespaces);
        return new MapElement(map);
    }
}