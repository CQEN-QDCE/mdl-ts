import { DataElement } from "../data-element/data-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";

export class DeviceKeyInfo {

    private deviceKey: MapElement;
    private keyAuthorizations: MapElement | null = null;
    private keyInfo: MapElement | null = null;

    constructor(deviceKey: MapElement, 
                keyAuthorizations: MapElement | null = null, 
                keyInfo: MapElement | null = null) {
        this.deviceKey = deviceKey;
        this.keyAuthorizations = keyAuthorizations;
        this.keyInfo = keyInfo;
    }

    static fromMapElement(element: MapElement): DeviceKeyInfo {
        const deviceKey = element.get(new MapKey('deviceKey'));
        const keyAuthorizations = element.get(new MapKey('keyAuthorizations'));
        const keyInfo = element.get(new MapKey('keyInfo'));
        return new DeviceKeyInfo(<MapElement>deviceKey, <MapElement>keyAuthorizations, <MapElement>keyInfo);
    }
    
    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        map.set(new MapKey('deviceKey'), this.deviceKey);
        if (this.keyAuthorizations) map.set(new MapKey('keyAuthorizations'), this.keyAuthorizations);
        if (this.keyInfo) map.set(new MapKey('keyInfo'), this.keyInfo);
        return new MapElement(map);
    }
}