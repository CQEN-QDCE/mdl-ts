import { CborByteString } from "../cbor/types/cbor-byte-string";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborMap } from "../data-element/cbor-map";
import { MapKey } from "../data-element/map-key";
import { CborNumber } from "../cbor/types/cbor-number";
import { CborTextString } from "../cbor/types/cbor-text-string";
import { SecureRandom } from "../utils/secure-random";


export class IssuerSignedItem {

    private constructor(public readonly digestID: number, 
                        public readonly randomSalt: ArrayBuffer, 
                        public readonly elementIdentifier: string, 
                        public readonly elementValue: CborDataItem) {
    }

    public static build(digestID: number, elementIdentifier: string, elementValue: CborDataItem): IssuerSignedItem {
        return new IssuerSignedItem(digestID, 
                                    new Uint8Array(new TextEncoder().encode(SecureRandom.generate(16))).buffer, 
                                    elementIdentifier, 
                                    elementValue);
    }
    
    toMapElement(): CborMap {
        const map = new Map<MapKey, CborDataItem>();
        map.set(new MapKey('digestID'), new CborNumber(this.digestID));
        map.set(new MapKey('random'), new CborByteString(this.randomSalt));
        map.set(new MapKey('elementIdentifier'), new CborTextString(this.elementIdentifier));
        map.set(new MapKey('elementValue'), this.elementValue);
        return new CborMap(map);
    }

    static fromMapElement(element: CborMap): IssuerSignedItem {
        const digestID = element.get(new MapKey('digestID'));
        const random = element.get(new MapKey('random'));
        const elementIdentifier = element.get(new MapKey('elementIdentifier'));
        const elementValue = element.get(new MapKey('elementValue'));
        return new IssuerSignedItem(digestID.getValue(), random.getValue(), elementIdentifier.getValue(), elementValue);
    }

}