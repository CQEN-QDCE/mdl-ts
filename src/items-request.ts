import { DataElement } from "./data-element/data-element";
import { MapElement } from "./data-element/map-element";
import { MapKey } from "./data-element/map-key";
import { StringElement } from "./data-element/string-element";

export class ItemsRequest {

    public readonly docType: string;
    public namespaces: MapElement;

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
        const map = new Map<MapKey, DataElement>();
        map.set(new MapKey('docType'), new StringElement(this.docType));
        map.set(new MapKey('nameSpaces'), this.namespaces);
        return new MapElement(map);
    }
}