import { Cbor } from "../cbor/cbor";
import { CoseKey } from "../cose/cose-key";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborMap } from "../data-element/cbor-map";
import { MapKey } from "../data-element/map-key";

export class DeviceKeyInfo {

    private deviceKey: CoseKey | null = null;
    private keyAuthorizations: CborMap | null = null;
    private keyInfo: CborMap | null = null;

    constructor(deviceKey: CoseKey, 
                keyAuthorizations: CborMap | null = null, 
                keyInfo: CborMap | null = null) {
        this.deviceKey = deviceKey;
        this.keyAuthorizations = keyAuthorizations;
        this.keyInfo = keyInfo;
    }

    static fromMapElement(element: CborMap): DeviceKeyInfo {
        const deviceKey = element.get(new MapKey('deviceKey'));
        const keyAuthorizations = element.get(new MapKey('keyAuthorizations'));
        const keyInfo = element.get(new MapKey('keyInfo'));
        return new DeviceKeyInfo(deviceKey.getValue() === null ? null : CborDataItem.to(CoseKey, <CborMap>deviceKey), <CborMap>keyAuthorizations, <CborMap>keyInfo);
    }
    
    toMapElement(): CborMap {
        const map = new Map<MapKey, CborDataItem>();
        map.set(new MapKey('deviceKey'), CborDataItem.from(this.deviceKey));
        if (this.keyAuthorizations) map.set(new MapKey('keyAuthorizations'), this.keyAuthorizations);
        if (this.keyInfo) map.set(new MapKey('keyInfo'), this.keyInfo);
        return new CborMap(map);
    }
}