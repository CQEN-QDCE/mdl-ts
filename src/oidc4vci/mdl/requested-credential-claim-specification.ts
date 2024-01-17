import { ClaimDisplayProperties } from "./claim-display-properties";

export class RequestedCredentialClaimSpecification {
    constructor(public readonly mandatory: boolean, // @SerialName("mandatory").
        public readonly valueType: string, //@SerialName("value_type")
        public readonly display: ClaimDisplayProperties) {

    }
}