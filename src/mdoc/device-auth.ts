import { COSEMac0 } from "../cose/cose-mac-0";
import { COSESign1 } from "../cose/cose-sign-1";
import { DataElement } from "../data-element/data-element";
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
        const map = new Map<MapKey, DataElement>();
        if (this.deviceMac) map.set(new MapKey('deviceMac'), this.deviceMac.toDataElement());
        if (this.deviceSignature) map.set(new MapKey('deviceSignature'), this.deviceSignature.toDataElement());
        return new MapElement(map);
    }

    static fromMapElement(mapElement: MapElement): DeviceAuth {
        let deviceMac = mapElement.get(new MapKey('deviceMac'));
        if (!deviceMac) deviceMac = null;
        let deviceSignature = mapElement.get(new MapKey('deviceSignature'));
        if (!deviceSignature) deviceSignature = null;
        return new DeviceAuth(COSEMac0.fromDataElement(new ListElement(deviceMac.value)), deviceSignature ? COSESign1.fromDataElement(new ListElement(deviceSignature.value)) : null);
    }
}