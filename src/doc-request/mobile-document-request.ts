import { COSECryptoProvider } from "../cose/cose-crypto-provider";
import { COSESign1 } from "../cose/cose-sign-1";
import { DataElement } from "../data-element/data-element";
import { DataElementDeserializer } from "../data-element/data-element-deserializer";
import { DataElementSerializer } from "../data-element/data-element-serializer";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { StringElement } from "../data-element/string-element";
import { MDocRequestVerificationParams } from "./mdoc-request-verification-params";
import { ItemsRequest } from "../items-request";
import { ReaderAuthentication } from "../reader-authentication";
import { Lazy } from "../utils/lazy";

export class MobileDocumentRequest {

    private readonly itemsRequestBytes: EncodedCBORElement;
    public readonly readerAuthentication: COSESign1 | null;
    private readonly lazyDecodedItemsRequest: Lazy<ItemsRequest>;
    private readonly lazyNamespaces: Lazy<string[]>;

    constructor(itemsRequestBytes: EncodedCBORElement, 
                readerAuthentication: COSESign1 | null = null) {
        this.itemsRequestBytes = itemsRequestBytes;
        this.readerAuthentication = readerAuthentication;
        this.lazyDecodedItemsRequest = new Lazy<ItemsRequest>(() => this.initItemsRequest());
        this.lazyNamespaces = new Lazy<string[]>(() => this.initNamespaces());
    }

    get namespaces(): string[] {
        return this.lazyNamespaces.value;
    }

    get docType(): string {
        return this.itemsRequest.docType;
    }

    get itemsRequest(): ItemsRequest {
        return this.lazyDecodedItemsRequest.value;
    }

    getRequestedItemsFor(nameSpace: string): Map<string, boolean> {
        const itemsRequest = this.itemsRequest;
        const nameSpaces = itemsRequest.namespaces;
        const nameSpace2 = nameSpaces.get(new MapKey(nameSpace));
        const response: Map<string, boolean> = new Map<string, boolean>();
        if (!nameSpace2) return response;
        for (const [key, value] of nameSpace2.value) {
            response.set(key.str, value.value);
        }
        return response;
    }

    public async verify(verificationParams: MDocRequestVerificationParams, cryptoProvider: COSECryptoProvider): Promise<boolean> {
        return (!verificationParams || await this.verifyReaderAuthentication(verificationParams, cryptoProvider)) && 
               (verificationParams.allowedToRetain == null || this.checkRestrictedFieldsAllowedToRetain(verificationParams));
    }

    private async verifyReaderAuthentication(verificationParams: MDocRequestVerificationParams, cryptoProvider: COSECryptoProvider): Promise<boolean> {
        const readerAuthentication = this.getReaderSignedPayload(verificationParams.readerAuthentication);
        this.readerAuthentication.attachPayload(readerAuthentication);
        return await cryptoProvider.verify1(this.readerAuthentication, verificationParams.readerKeyId)
    }

    private checkRestrictedFieldsAllowedToRetain(verificationParams: MDocRequestVerificationParams): boolean {
        for (const nameSpace of this.namespaces) {
            const requestedItems = this.getRequestedItemsFor(nameSpace);
            const allowedToRetain = verificationParams.allowedToRetain.get(nameSpace);
            for (const [name, value] of requestedItems) {
                if (value && !allowedToRetain.has(name)) return false;
            }
        }
        return true;
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        map.set(new MapKey('itemsRequest'), this.itemsRequestBytes);
        if (this.readerAuthentication) map.set(new MapKey('readerAuth'), this.readerAuthentication.toDataElement());
        return new MapElement(map);
    }

    private getReaderSignedPayload(readerAuthentication: ReaderAuthentication): ArrayBuffer {
        return DataElementSerializer.toCBOR(EncodedCBORElement.encode(readerAuthentication.toListElement()));
    }
    
    private initItemsRequest(): ItemsRequest {
        const dataElement = DataElementDeserializer.fromCBOR(this.itemsRequestBytes.value);
        const mapElement = <MapElement>dataElement;
        const docType = mapElement.get(new MapKey('docType'));
        const nameSpaces = mapElement.get(new MapKey('nameSpaces'));
        return new ItemsRequest((<StringElement>docType).value, <MapElement>nameSpaces);
    }

    private initNamespaces(): string[] {
        const nameSpaces: string[] = [];
        for (const [key, value] of this.itemsRequest.namespaces.value) {
            nameSpaces.push(key.str);
        }
        return nameSpaces;
    }

}