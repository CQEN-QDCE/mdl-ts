export class CredentialRequestProof {
    constructor(public readonly proofType: string, // @SerialName("proof_type")
                public readonly jwt: string, // @SerialName("jwt")
                ) {

    }
}