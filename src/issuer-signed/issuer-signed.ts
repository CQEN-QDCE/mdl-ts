import { CborConvertible } from "../cbor/cbor-convertible";
import { COSESign1 } from "../cose/cose-sign-1";
import { CborArray } from "../data-element/cbor-array";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborEncodedDataItem } from "../cbor/types/cbor-encoded-data-item";
import { CborMap } from "../data-element/cbor-map";
import { MapKey } from "../data-element/map-key";
import { IssuerSignedItem } from "./issuer-signed-item";
import { CborDecoder } from "../cbor/cbor-decoder";

export class IssuerSigned implements CborConvertible {

    public readonly namespaces: Map<string, IssuerSignedItem[]>;
    
    public readonly issuerAuth: COSESign1;
    
    constructor(issuerNamespaces: Map<string, IssuerSignedItem[]>, issuerAuth: COSESign1) {
        this.namespaces = issuerNamespaces;
        this.issuerAuth = issuerAuth;
    }

    fromCborDataItem(dataItem: CborDataItem): IssuerSigned {
        const mapElement = <CborMap>dataItem;
        const nameSpaces = mapElement.get(new MapKey('nameSpaces'));
        const issuerAuth = mapElement.get(new MapKey('issuerAuth'));
        const nameSpaces2 = new Map<string, IssuerSignedItem[]>();
        for (const [key, value] of (<CborMap>nameSpaces).getValue()) {
            const issuerSignedItems: IssuerSignedItem[] = [];
            for (const encodedCborElement of <CborEncodedDataItem[]>value.getValue()) {
                issuerSignedItems.push(IssuerSignedItem.fromMapElement(<CborMap>CborDecoder.decode(encodedCborElement.getValue())));
            }
            nameSpaces2.set(key.str, issuerSignedItems);
        }
        return new IssuerSigned(nameSpaces2, CborDataItem.to(COSESign1, <CborArray>issuerAuth));
    }

    toCborDataItem(): CborDataItem {
//        const map = new Map<MapKey, CborDataItem>();
//        const namespaces = new Map<string, EncodedCBORElement[]>();
//        for (const [namespace, issuerSignedItems] of this.issuerSignedItemsByNamespace) {
//            const encodedCborElements:EncodedCBORElement[] = [];
//            for (const issuerSignedItem of issuerSignedItems) {
//                encodedCborElements.push(EncodedCBORElement.encode(issuerSignedItem.toMapElement()));
//            }
//            namespaces.set(namespace, encodedCborElements);
//        }
//        map.set(new MapKey('issuerAuth'), this.issuerAuth.toDataElement());
//        return new MapElement(map);
        throw new Error("Not implemented");
    }
}