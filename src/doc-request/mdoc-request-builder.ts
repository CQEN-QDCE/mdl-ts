import { COSECryptoProvider } from "../cose/cose-crypto-provider";
import { COSESign1 } from "../cose/cose-sign-1";
import { BooleanElement } from "../data-element/boolean-element";
import { DataElement } from "../data-element/data-element";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { StringElement } from "../data-element/string-element";
import { ItemsRequest } from "../items-request";
import { MDocRequest } from "../mdoc-request";
import { ReaderAuthentication } from "../reader-authentication";
import { DataElementSerializer } from '../data-element/data-element-serializer';
import { DataElementDeserializer } from "../data-element/data-element-deserializer";

export class MDocRequestBuilder {
    
    docType: string;
    
    nameSpaces: Map<string, Map<string, boolean>>;
    
    constructor(docType: string) {
        this.docType = docType;
        this.nameSpaces = new Map<string, Map<string, boolean>>();
    }

    addDataElementRequest(nameSpace: string, elementIdentifier: string, intentToRetain: boolean): MDocRequestBuilder {
        let dataElementIdentifiers = this.nameSpaces.get(nameSpace);
        if (!dataElementIdentifiers) {
            dataElementIdentifiers = new Map<string, boolean>();
            this.nameSpaces.set(nameSpace, dataElementIdentifiers);
        }
        dataElementIdentifiers.set(elementIdentifier, intentToRetain);
        return this;
    }

    build(readerAuth: COSESign1 | null = null): MDocRequest {
        return new MDocRequest(this.buildEncodedItemsRequest(), readerAuth);
    }

    async sign(sessionTranscript: ListElement, cryptoProvider: COSECryptoProvider, keyID: string | null = null): Promise<MDocRequest> {
        const encodedItemsRequest = this.buildEncodedItemsRequest();
        const readerAuthentication = new ReaderAuthentication(sessionTranscript, this.buildItemsRequest(encodedItemsRequest));
        const payload = DataElementSerializer.toCBOR(EncodedCBORElement.encode(readerAuthentication.toListElement()));
        const readerAuth = await cryptoProvider.sign1(payload, keyID)
        return new MDocRequest(encodedItemsRequest, readerAuth.detachPayload());
    }

    private buildItemsRequest(encodedItemsRequest: EncodedCBORElement): ItemsRequest {
        const dataElement = DataElementDeserializer.fromCBOR(encodedItemsRequest.value);
        const mapElement = <MapElement>dataElement;
        const docType = mapElement.get(new MapKey('docType'));
        const nameSpaces = mapElement.get(new MapKey('nameSpaces'));
        return new ItemsRequest((<StringElement>docType).value, <MapElement>nameSpaces);
    }
    
    private buildEncodedItemsRequest(): EncodedCBORElement {
        const outerMap = new Map<MapKey, DataElement>();
        for (const nameSpace of this.nameSpaces.keys()) {
            const value = this.nameSpaces.get(nameSpace);
            const innerMap = new Map<MapKey, DataElement>();
            for (const elementIdentifier of value.keys()) {
                innerMap.set(new MapKey(elementIdentifier), new BooleanElement(value.get(elementIdentifier)));
            }
            outerMap.set(new MapKey(nameSpace), new MapElement(innerMap));
        }
        const itemsRequest = new ItemsRequest(this.docType, new MapElement(outerMap));
        return EncodedCBORElement.encode(itemsRequest.toMapElement());
    }
}