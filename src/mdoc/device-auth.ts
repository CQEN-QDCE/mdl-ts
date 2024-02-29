import { COSEMac0 } from "../cose/cose-mac-0";
import { COSESign1 } from "../cose/cose-sign-1";
import { CborArray } from "../data-element/cbor-array";
import { CborDataItem } from "../cbor/cbor-data-item";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";

export class DeviceAuth {

    deviceMac: COSEMac0;

    deviceSignature: COSESign1;

    constructor(deviceMac: COSEMac0 | null = null, deviceSignature: COSESign1 | null = null) {
        this.deviceMac = deviceMac;
        this.deviceSignature = deviceSignature;
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, CborDataItem>();
        if (this.deviceMac) map.set(new MapKey('deviceMac'), CborDataItem.from(this.deviceMac));
        if (this.deviceSignature) map.set(new MapKey('deviceSignature'), CborDataItem.from(this.deviceSignature));
        return new MapElement(map);
    }

    static fromMapElement(mapElement: MapElement): DeviceAuth {
        let deviceMac = mapElement.get(new MapKey('deviceMac'));
        if (!deviceMac) deviceMac = null;
        let deviceSignature = mapElement.get(new MapKey('deviceSignature'));
        if (!deviceSignature) deviceSignature = null;
        return new DeviceAuth(CborDataItem.to(COSEMac0, <CborArray>deviceMac), 
                              deviceSignature ? CborDataItem.to(COSESign1, <CborArray>deviceSignature) : null);
    }
}