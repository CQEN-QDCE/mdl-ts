import { OidcClient } from "./oidc-client";

export class OidcServerRetrievalProcessClient {

    constructor(private readonly oidcClient: OidcClient,
                private readonly privateKey: ECPrivateKey) {

    }

    public process(serverRetrievalToken: string, docType: string, documentRequest: Map<string, Map<string, boolean>>): JsonObject {
        const configuration = JSON.parse(this.oidcClient.configuration);

        const flatten: string[] = [];
        for (const [key, value] of documentRequest) {
            flatten.push(key + ":" + value);
        }
        const scope = flatten.join(" ");

        const registrationRequest: any = {};
        registrationRequest.redirect_uris = ["http://127.0.0.1:56464/callback"]; // TODO: à changer.
        registrationRequest.scope = scope;
        const registrationResponse = JSON.parse(
            this.oidcClient.clientRegistration(registrationRequest.toString())
        )

        const thirtyDays = 30 * 24 * 60 * 60;
        const authorizationRequest = new Map<string, string>();
        authorizationRequest.set("client_id", registrationResponse.client_id);
        authorizationRequest.set("scope", registrationResponse.scope);
        authorizationRequest.set("redirect_uri", registrationResponse.redirect_uri);
        authorizationRequest.set("response_type", "code");
    //    "login_hint" to Jwt.encode(buildJsonObject {
    //        put("id", serverRetrievalToken)
    //        put("iat", Timestamp.now().toEpochMilli() / 1000)
    //        put("exp", (Timestamp.now().toEpochMilli() / 1000) + thirtyDays)
    //    }, privateKey);

        const authorizationResponse = JSON.parse(this.oidcClient.authorization(authorizationRequest));

        // step 4
        const tokenRequest = new Map<string, string>();
        tokenRequest.set("grant_type", "authorization_code");
        tokenRequest.set("code", authorizationResponse.query.code);
        tokenRequest.set("redirect_uri", registrationRequest.redirect_uris[0]);
        tokenRequest.set("client_id", registrationResponse.client_id);
        tokenRequest.set("client_secret", registrationResponse.client_secret);
    
        const tokenResponse = JSON.parse(this.oidcClient.getIdToken(tokenRequest));

        // step 5
        const validateIdTokenResponse = JSON.parse(this.oidcClient.validateIdToken());

        // TODO validate chain (use TrustManager?)
//        val certicateChain =
//            Jwt.parseCertificateChain(
//               validateIdTokenResponse["keys"]?.jsonArray?.first()?.jsonObject?.get(
//                    "x5c"
//                )?.jsonArray?.map { it.jsonPrimitive.content }!!
//            )

//        val certicate = certicateChain.first()

//        val publicKey = certicate.publicKey as ECPublicKey

//    if (!Jwt.verify(tokenResponse["id_token"]?.jsonPrimitive?.content.toString(), publicKey) ||
//        !Jwt.verify(tokenResponse["access_token"]?.jsonPrimitive?.content.toString(), publicKey)
  //  ) {
//        throw Exception("The token response could not be verified")
  //  }
    //return Jwt.decode(tokenResponse["id_token"]?.jsonPrimitive?.content.toString()).payload
    }
}