import { COSECryptoProvider } from "./cose/cose-crypto-provider";
import { COSESign1 } from "./cose/cose-sign-1";
import { DataElement } from "./data-element/data-element";
import { DataElementSerializer } from "./data-element/data-element-serializer";
import { EncodedCBORElement } from "./data-element/encoded-cbor-element";
import { IssuerSignedItem } from "./issuer-signed/issuer-signed-item";
import { MobileDocument } from "./mobile-document";
import { DeviceSigned } from "./mdoc/device-signed";
import { IssuerSigned } from "./issuer-signed/issuer-signed";
import { MobileSecurityObject } from "./mdoc/mobile-security-object";
import { DeviceKeyInfo } from "./mso/device-key-info";
import { ValidityInfo } from "./mso/validity-info";

export class MobileDocumentBuilder {

    private UNSIGNED_INTEGER_MAX_VALUE = 4294967295;
    private docType: string;
    private issuerSignedItemsByNamespace = new Map<string, IssuerSignedItem[]>();

    constructor(docType: string) {
        if (!docType) throw new Error('docType must not be null');
        this.docType = docType;
    }

    addIssuerSignedItems(namespace: string, issuerSignedItems: IssuerSignedItem[]): MobileDocumentBuilder {
        this.getIssuerSignedItemsByNameSpace(namespace).concat(issuerSignedItems);
        return this;
    }

    addItemToSign(namespace: string, elementIdentifier: string, elementValue: DataElement): MobileDocumentBuilder {
        const issuerSignedItems = this.getIssuerSignedItemsByNameSpace(namespace);
        issuerSignedItems.push(IssuerSignedItem.createWithRandomSalt(this.getNextDigestID(issuerSignedItems), elementIdentifier, elementValue));
        return this;
    }

    build(issuerAuthentication: COSESign1, deviceSigned: DeviceSigned | null = null): MobileDocument {
//        const namespaces = new Map<string, EncodedCBORElement[]>();
//        for (const [namespace, issuerSignedItems] of this.issuerSignedItemsByNamespace) {
//            const encodedCborElements:EncodedCBORElement[] = [];
//            for (const issuerSignedItem of issuerSignedItems) {
//                encodedCborElements.push(EncodedCBORElement.encode(issuerSignedItem.toMapElement()));
//            }
//            namespaces.set(namespace, encodedCborElements);
//        }
        return new MobileDocument(this.docType,
                                  new IssuerSigned(this.issuerSignedItemsByNamespace, issuerAuthentication),
                                  deviceSigned);
    }

    async sign(validityInfo: ValidityInfo, deviceKeyInfo: DeviceKeyInfo, cryptoProvider: COSECryptoProvider, keyID: string | null = null): Promise<MobileDocument> {
        const mso = await MobileSecurityObject.createFor(this.issuerSignedItemsByNamespace, deviceKeyInfo, this.docType, validityInfo);
        const payload = DataElementSerializer.toCBOR(EncodedCBORElement.encode(mso.toMapElement()));
        const issuerAuth = await cryptoProvider.sign1(payload, keyID);
        return this.build(issuerAuth);
    }

    private getIssuerSignedItemsByNameSpace(nameSpace: string): IssuerSignedItem[] {
        let issuerSignedItems = this.issuerSignedItemsByNamespace.get(nameSpace);
        if (!issuerSignedItems) {
            issuerSignedItems = [];
            this.issuerSignedItemsByNamespace.set(nameSpace, issuerSignedItems);
        } 
        return issuerSignedItems;
    }

    private getNextDigestID(issuerSignedItems: IssuerSignedItem[]): number {
        let maxDigestID: number = 0;
        if (issuerSignedItems.length == 0) return 0;
        for (const issuerSignedItem of issuerSignedItems) {
            if (issuerSignedItem.digestID.value > maxDigestID) maxDigestID = issuerSignedItem.digestID.value;
        }
        return maxDigestID + 1 > this.UNSIGNED_INTEGER_MAX_VALUE ? 0 : maxDigestID + 1;
    }
}