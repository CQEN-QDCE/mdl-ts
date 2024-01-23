import { IssuerSignedItem } from "./issuer-signed-item";

export class IssuerNamespace {
    
    constructor(public readonly name: string, 
                public readonly issuerSignedItems: IssuerSignedItem[]) {
    }

}