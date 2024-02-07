import { Cbor } from "../cbor/cbor";
import { CborDataItemConvertable } from "../cbor/cbor-data-item-convertable";
import { COSESign1 } from "../cose/cose-sign-1";
import { CborDataItem } from "../data-element/cbor-data-item";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { IssuerSignedItem } from "./issuer-signed-item";

export class IssuerSigned implements CborDataItemConvertable {

    public readonly namespaces: Map<string, IssuerSignedItem[]>;
    
    public readonly issuerAuth: COSESign1;
    
    constructor(issuerNamespaces: Map<string, IssuerSignedItem[]>, issuerAuth: COSESign1) {
        this.namespaces = issuerNamespaces;
        this.issuerAuth = issuerAuth;
    }

    fromCborDataItem(dataItem: CborDataItem): IssuerSigned {
        const mapElement = <MapElement>dataItem;
        const nameSpaces = mapElement.get(new MapKey('nameSpaces'));
        const issuerAuth = mapElement.get(new MapKey('issuerAuth'));
        const nameSpaces2 = new Map<string, IssuerSignedItem[]>();
        for (const [key, value] of (<MapElement>nameSpaces).value) {
            const issuerSignedItems: IssuerSignedItem[] = [];
            for (const encodedCborElement of <EncodedCBORElement[]>value.value) {
                issuerSignedItems.push(IssuerSignedItem.fromMapElement(<MapElement>encodedCborElement.decode()));
            }
            nameSpaces2.set(key.str, issuerSignedItems);
        }
        return new IssuerSigned(nameSpaces2, Cbor.fromDataItem(new ListElement(issuerAuth.value), COSESign1));
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