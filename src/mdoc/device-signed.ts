import { DataElement } from "../data-element/data-element";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { DeviceAuth } from "./device-auth";

export class DeviceSigned {
    
    private nameSpaces: EncodedCBORElement;
    
    public deviceAuth: DeviceAuth;

    constructor(nameSpaces: EncodedCBORElement, deviceAuth: DeviceAuth) {
        this.nameSpaces = nameSpaces;
        this.deviceAuth = deviceAuth;
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        map.set(new MapKey('nameSpaces'), this.nameSpaces);
        map.set(new MapKey('deviceAuth'), this.deviceAuth.toMapElement());
        return new MapElement(map);
    }

    static fromMapElement(mapElement: MapElement): DeviceSigned {
        const nameSpaces = mapElement.get(new MapKey('nameSpaces')) as EncodedCBORElement;
        const deviceAuth = mapElement.get(new MapKey('deviceAuth'));
        return new DeviceSigned(nameSpaces, DeviceAuth.fromMapElement(<MapElement>deviceAuth));
    }
}