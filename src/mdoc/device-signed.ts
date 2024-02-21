import { CborDataItemConvertable } from "../cbor/cbor-data-item-convertable";
import { CborDataItem2 } from "../data-element/cbor-data-item2";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { DeviceAuth } from "./device-auth";

export class DeviceSigned implements CborDataItemConvertable {
    
    private nameSpaces: EncodedCBORElement;
    
    public deviceAuth: DeviceAuth;

    constructor(nameSpaces: EncodedCBORElement, deviceAuth: DeviceAuth) {
        this.nameSpaces = nameSpaces;
        this.deviceAuth = deviceAuth;
    }

    fromCborDataItem(dataItem: CborDataItem2): DeviceSigned {
        const mapElement = <MapElement>dataItem;
        const nameSpaces = mapElement.get(new MapKey('nameSpaces')) as EncodedCBORElement;
        const deviceAuth = mapElement.get(new MapKey('deviceAuth'));
        return new DeviceSigned(nameSpaces, DeviceAuth.fromMapElement(<MapElement>deviceAuth));
    }

    toCborDataItem(): CborDataItem2 {
        const map = new Map<MapKey, CborDataItem2>();
        map.set(new MapKey('nameSpaces'), this.nameSpaces);
        map.set(new MapKey('deviceAuth'), this.deviceAuth.toMapElement());
        return new MapElement(map);
    }

}