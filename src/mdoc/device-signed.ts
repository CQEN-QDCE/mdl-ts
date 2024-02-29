import { CborConvertible } from "../cbor/cbor-convertible";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborEncodedDataItem } from "../cbor/types/cbor-encoded-data-item";
import { CborMap } from "../data-element/cbor-map";
import { MapKey } from "../data-element/map-key";
import { DeviceAuth } from "./device-auth";

export class DeviceSigned implements CborConvertible {
    
    private nameSpaces: CborEncodedDataItem;
    
    public deviceAuth: DeviceAuth;

    constructor(nameSpaces: CborEncodedDataItem, deviceAuth: DeviceAuth) {
        this.nameSpaces = nameSpaces;
        this.deviceAuth = deviceAuth;
    }

    fromCborDataItem(dataItem: CborDataItem): DeviceSigned {
        const mapElement = <CborMap>dataItem;
        const nameSpaces = mapElement.get(new MapKey('nameSpaces')) as CborEncodedDataItem;
        const deviceAuth = mapElement.get(new MapKey('deviceAuth'));
        return new DeviceSigned(nameSpaces, DeviceAuth.fromMapElement(<CborMap>deviceAuth));
    }

    toCborDataItem(): CborDataItem {
        const map = new Map<MapKey, CborDataItem>();
        map.set(new MapKey('nameSpaces'), this.nameSpaces);
        map.set(new MapKey('deviceAuth'), this.deviceAuth.toMapElement());
        return new CborMap(map);
    }

}