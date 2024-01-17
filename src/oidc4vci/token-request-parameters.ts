export class TokenRequestParameters {
    constructor(public readonly grantType: string, // @SerialName("grant_type")
        public readonly code: string, // @SerialName("code")
        public readonly redirectUrl: string, // @SerialName("redirect_uri")
        public readonly clientId: string, // @SerialName("client_id")
        public readonly preAuthorizedCode: string, // @SerialName("pre-authorized_code")
        public readonly codeVerifier: string, // @SerialName("code_verifier")
        public readonly userPin: string // @SerialName("user_pin")
        ) {

    }
}