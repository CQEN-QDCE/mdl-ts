import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { StringElement } from "../data-element/string-element";
import { DeviceKeyInfo } from "../mso/device-key-info";
import { IssuerSignedItem } from "../issuer-signed/issuer-signed-item";
import { ValidityInfo } from "../mso/validity-info";
import { DigestAlgorithm } from "./digest-algorithm.enum";
import { Crypto } from "@peculiar/webcrypto";
import { DataElementSerializer } from "../data-element/data-element-serializer";
import { ArrayBufferComparer } from "../utils/array-buffer-comparer";

// Mobile security object (MSO), representing the payload of the issuer signature, for the issuer signed part of the mdoc.
export class MobileSecurityObject {

    version: StringElement;
    digestAlgorithm: StringElement;
    valueDigests: MapElement;
    deviceKeyInfo: DeviceKeyInfo;
    docType: StringElement;
    validityInfo: ValidityInfo;

    constructor(version: StringElement, 
                digestAlgorithm: StringElement,
                valueDigests: MapElement,
                deviceKeyInfo: DeviceKeyInfo,
                docType: StringElement,
                validityInfo: ValidityInfo) {
        this.version = version;
        this.digestAlgorithm = digestAlgorithm;
        this.valueDigests = valueDigests;
        this.deviceKeyInfo = deviceKeyInfo;
        this.docType = docType;
        this.validityInfo = validityInfo;
    }

    getValueDigestsFor(nameSpace: string): Map<number, ArrayBuffer> {
        const nameSpaceElement = this.valueDigests.get(new MapKey(nameSpace));
        if (!nameSpaceElement) return new  Map<number, ArrayBuffer>();
        const digestMap = new Map<number, ArrayBuffer>();
        for (const [key, value] of nameSpaceElement.value) {
            if (value instanceof ByteStringElement) {
                digestMap.set(key.int, value.value);
            }
        }
        return digestMap;
    }

    get nameSpaces(): string[] {
        const nameSpaces: string[] = [];
        for (const [key, value] of this.valueDigests.value) {
            nameSpaces.push(key.str);
        }
        //new Set<string>([...this.valueDigests.value.keys()]);
        return nameSpaces;
    }

    static fromMapElement(mapElement: MapElement): MobileSecurityObject {
        const version = <StringElement>mapElement.get(new MapKey('version'));
        const digestAlgorithm = <StringElement>mapElement.get(new MapKey('digestAlgorithm'));
        const valueDigests = <MapElement>mapElement.get(new MapKey('valueDigests'));
        const deviceKeyInfo = DeviceKeyInfo.fromMapElement(<MapElement>mapElement.get(new MapKey('deviceKeyInfo')));
        const docType = <StringElement>mapElement.get(new MapKey('docType'));
        const validityInfo = ValidityInfo.fromMapElement(<MapElement>mapElement.get(new MapKey('validityInfo')));
        return new MobileSecurityObject(version, digestAlgorithm, valueDigests, deviceKeyInfo, docType, validityInfo);
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        map.set(new MapKey('version'), this.version);
        map.set(new MapKey('digestAlgorithm'), this.digestAlgorithm);
        map.set(new MapKey('valueDigests'), this.valueDigests);
        map.set(new MapKey('deviceKeyInfo'), this.deviceKeyInfo.toMapElement());
        map.set(new MapKey('docType'), this.docType);
        map.set(new MapKey('validityInfo'), this.validityInfo.toMapElement());
        return new MapElement(map);
    }

    async verifySignedItems(nameSpace: string, items: EncodedCBORElement[]): Promise<boolean> {
        const valueDigests = this.getValueDigestsFor(nameSpace);
        const digestAlgorithm: DigestAlgorithm = <DigestAlgorithm>this.digestAlgorithm.value;
        for (const item of items) {
            const issuerSignedItem = IssuerSignedItem.fromMapElement(<MapElement>item.decode());
            const digestID = issuerSignedItem.digestID.value;
            if (!valueDigests.has(digestID)) return false;
            let valueDigest = valueDigests.get(digestID);
            if (valueDigest instanceof Buffer) valueDigest = new Uint8Array(valueDigest).buffer;
            const itemDigest = await MobileSecurityObject.digestItem(item, digestAlgorithm);
            if (!ArrayBufferComparer.equals(valueDigest, itemDigest)) return false;
        }
        return true;
    }

    static async digestItem(encodedItem: EncodedCBORElement, digestAlgorithm: DigestAlgorithm): Promise<ArrayBuffer> {
        const crypto = new Crypto();
        const hash = await crypto.subtle.digest(digestAlgorithm, DataElementSerializer.toCBOR(encodedItem));
        return hash
    }

    static async createFor(nameSpaces: Map<string, IssuerSignedItem[]>,
                     deviceKeyInfo: DeviceKeyInfo,
                     docType: string,
                     validityInfo: ValidityInfo,
                     digestAlgorithm: DigestAlgorithm = DigestAlgorithm.SHA256): Promise<MobileSecurityObject> {
        const valueDigests = new Map<MapKey, DataElement>();
        for (const [namespace, issuerSignedItems] of nameSpaces) {
            const nameSpaceDigests = new Map<MapKey, DataElement>();
            for (const issuerSignedItem of issuerSignedItems) {
                const digest = await this.digestItem(EncodedCBORElement.encode(issuerSignedItem.toMapElement()), digestAlgorithm);
                nameSpaceDigests.set(new MapKey(issuerSignedItem.digestID.value), new ByteStringElement(digest));
            }
            valueDigests.set(new MapKey(namespace), new MapElement(nameSpaceDigests));
        }
        const mso = new MobileSecurityObject(new StringElement('1.0'), 
                                             new StringElement(digestAlgorithm.toString()), 
                                             new MapElement(valueDigests), 
                                             deviceKeyInfo, 
                                             new StringElement(docType), 
                                             validityInfo);
        return mso;
    }
}