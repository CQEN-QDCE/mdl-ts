import { COSECryptoProvider } from "../cose/cose-crypto-provider";
import { COSESign1 } from "../cose/cose-sign-1";
import { CborBoolean } from "../cbor/types/cbor-boolean";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborEncodedDataItem } from "../cbor/types/cbor-encoded-data-item";
import { CborMap } from "../data-element/cbor-map";
import { MapKey } from "../data-element/map-key";
import { CborTextString } from "../cbor/types/cbor-text-string";
import { ItemsRequest } from "./items-request";
import { MobileDocumentRequest } from "./mobile-document-request";
import { ReaderAuthentication } from "../reader-authentication";
import { CborEncoder } from '../cbor/cbor-encoder';
import { CborDecoder } from "../cbor/cbor-decoder";
import { CborArray } from "../data-element/cbor-array";

export class MDocRequestBuilder {
    
    docType: string;
    
    itemRequestsNameSpaces: Map<string, Map<string, boolean>>;
    
    constructor(docType: string) {
        this.docType = docType;
        this.itemRequestsNameSpaces = new Map<string, Map<string, boolean>>();
    }

    addItemRequest(namespace: string, elementIdentifier: string, intentToRetain: boolean): MDocRequestBuilder {
        let itemRequests = this.itemRequestsNameSpaces.get(namespace);
        if (!itemRequests) {
            itemRequests = new Map<string, boolean>();
            this.itemRequestsNameSpaces.set(namespace, itemRequests);
        }
        itemRequests.set(elementIdentifier, intentToRetain);
        return this;
    }

    public build(readerAuth: COSESign1 | null = null): MobileDocumentRequest {
        return new MobileDocumentRequest(this.buildEncodedItemsRequest(), readerAuth);
    }

    public async sign(sessionTranscript: CborArray, cryptoProvider: COSECryptoProvider, keyID: string | null = null): Promise<MobileDocumentRequest> {
        const encodedItemsRequest = this.buildEncodedItemsRequest();
        const readerAuthentication = new ReaderAuthentication(sessionTranscript, this.buildItemsRequest(encodedItemsRequest));
        const payload = CborEncoder.encode(CborEncodedDataItem.encode(readerAuthentication.toListElement()));
        const readerAuth = await cryptoProvider.sign1(payload, keyID)
        return new MobileDocumentRequest(encodedItemsRequest, readerAuth.detachPayload());
    }

    private buildItemsRequest(encodedItemsRequest: CborEncodedDataItem): ItemsRequest {
        const dataElement = CborDecoder.decode(encodedItemsRequest.getValue());
        const mapElement = <CborMap>dataElement;
        const docType = mapElement.get(new MapKey('docType'));
        const nameSpaces = mapElement.get(new MapKey('nameSpaces'));
        return new ItemsRequest((<CborTextString>docType).getValue(), <CborMap>nameSpaces);
    }
    
    private buildEncodedItemsRequest(): CborEncodedDataItem {
        const outerMap = new Map<MapKey, CborDataItem>();
        for (const nameSpace of this.itemRequestsNameSpaces.keys()) {
            const value = this.itemRequestsNameSpaces.get(nameSpace);
            const innerMap = new Map<MapKey, CborDataItem>();
            for (const elementIdentifier of value.keys()) {
                innerMap.set(new MapKey(elementIdentifier), new CborBoolean(value.get(elementIdentifier)));
            }
            outerMap.set(new MapKey(nameSpace), new CborMap(innerMap));
        }
        const itemsRequest = new ItemsRequest(this.docType, new CborMap(outerMap));
        return CborEncodedDataItem.encode(itemsRequest.toMapElement());
    }
}