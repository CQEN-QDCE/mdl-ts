import { CredentialFormatEnum } from "./credential-format.enum";
import { RequestedCredentialClaimSpecification } from "./mdl/requested-credential-claim-specification";

export class AuthorizationDetails {
    constructor(public readonly type: string, 
                public readonly format: CredentialFormatEnum,
                public readonly docType: string, 
                public readonly claims: Map<string, Map<string, RequestedCredentialClaimSpecification>>,
                public readonly types: string[],
                public readonly locations: string[]) {

    }
}