import { Cbor } from "../cbor/cbor";
import { COSEMac0 } from "../cose/cose-mac-0";
import { COSESign1 } from "../cose/cose-sign-1";
import { CborDataItem } from "../data-element/cbor-data-item";
import { ListElement } from "../data-element/list-element";
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
        if (this.deviceMac) map.set(new MapKey('deviceMac'), Cbor.asDataItem(this.deviceMac));
        if (this.deviceSignature) map.set(new MapKey('deviceSignature'), Cbor.asDataItem(this.deviceSignature));
        return new MapElement(map);
    }

    static fromMapElement(mapElement: MapElement): DeviceAuth {
        let deviceMac = mapElement.get(new MapKey('deviceMac'));
        if (!deviceMac) deviceMac = null;
        let deviceSignature = mapElement.get(new MapKey('deviceSignature'));
        if (!deviceSignature) deviceSignature = null;
        return new DeviceAuth(Cbor.fromDataItem(new ListElement(deviceMac.value), COSEMac0), 
                              deviceSignature ? Cbor.fromDataItem(new ListElement(deviceSignature.value), COSESign1) : null);
    }
}