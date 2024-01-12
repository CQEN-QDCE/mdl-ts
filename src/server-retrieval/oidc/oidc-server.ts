import { v4 as uuidv4 } from 'uuid';

export class OidcServer {

    private readonly MDL_DOCTYPE = "org.iso.18013.5.1.mDL";

//    private readonly supportedElements =
//    credentialTypeRepository.getMdocCredentialType(MDL_DOCTYPE)?.namespaces?.map { ns ->
//        ns.value.dataElements.values.map { "${ns.key}:${it.attribute.identifier}" }
//    }?.flatten()!!

    private readonly storageEngine: StorageEngine = new EphemeralStorageEngine();

    constructor(private readonly baseUrl: string,
                private readonly privateKey: ECPrivateKey,
                private readonly certificateChain: [X509Certificate],
                private readonly credentialTypeRepository: CredentialTypeRepository) {

    }

    get configuration(): string {
        const configuration: any = {};
        configuration.issuer = this.baseUrl;
        configuration.jwks_uri = `${this.baseUrl}/.well-known/jwks.json`;
        configuration.authorization_endpoint = `${this.baseUrl}/connect/authorize`;
        configuration.token_endpoint = `${this.baseUrl}/connect/token`;
        configuration.userinfo_endpoint = `${this.baseUrl}/connect/userinfo`;
        configuration.end_session_endpoint = `${this.baseUrl}/connect/end_session`;
        configuration.revocation_endpoint = `${this.baseUrl}/connect/revocation`;
        configuration.introspection_endpoint = `${this.baseUrl}/connect/introspec`;
        configuration.device_authorization_endpoint = `${this.baseUrl}/connect/deviceauthorization`;
        configuration.registration_endpoint = `${this.baseUrl}/connect/register`;
        configuration.frontchannel_logout_supported = true;
        configuration.frontchannel_logout_session_supported = true;
        configuration.backchannel_logout_supported = true;
        configuration.backchannel_logout_session_supported= true;
        configuration.scopes_supported = [];
        configuration.claims_supported = [];
        // TODO: Ajouter ceci.
        //configuration.scopes_supported", buildJsonArray { supportedElements.forEach { add(it) } })
        //configuration.claims_supported", buildJsonArray { supportedElements.forEach { add(it) } })
        configuration.grant_types_supported = ["authorization_code", "client_credentials", "refresh_token", "implicit", "urn:ietf:params:oauth:grant-type:device_code"];
        configuration.response_types_supported = ["code", "token", "id_token", "id_token token", "code id_token", "code token", "code id_token token"];
        configuration.response_modes_supported = ["form_post", "query", "fragment"];
        configuration.token_endpoint_auth_methods_supported = ["client_secret_basic", "client_secret_post"];
        configuration.subject_types_supported = ["public"];
        configuration.id_token_signing_alg_values_supported = ["ES256"];
        configuration.code_challenge_methods_supported = ["plain", "S256"];
        return JSON.stringify(configuration);
    }

    get clientRegistration(registrationRequest: string): string {
        const registrationRequestJson = JSON.parse(registrationRequest);
        const clientId = uuidv4();
        const response: any = {};
        response.client_id = clientId;
        response.client_id_issued_at = Date.now() / 1000;
        response.client_secret = uuidv4();
        response.client_secret_expires_at = 0;
        response.grant_types = ["authorization_code"];
        response.client_name = uuidv4();
        response.client_uri = null;
        response.logo_uri = null;
        response.redirect_uris = registrationRequestJson["redirect_uris"]!!)
        response.scope = registrationRequestJson["scope"]!!)
        cacheData(clientId, registrationRequestJson["scope"]?.jsonPrimitive?.content.toString())
        return JSON.stringify(response);
    }

    get authorization(authorizationRequest: Map<string,string>): string {
        /*
        const authorizationId = UUID.randomUUID().toString()
        val clientId = authorizationRequest["client_id"]!!
        val loginHint = authorizationRequest["login_hint"]!!

        // TODO: how to verify this JWT? It is not specified which key should be used...
        const serverRetrievalToken =
                Jwt.decode(loginHint).payload["id"]?.jsonPrimitive?.content.toString()
            val cachedData = getCachedData(clientId) ?: throw Exception("Client was not registered")
    
            // TODO: should the scope in the registration request be the same as in the authorization request?
            // for now: update the cache with the scope in the authorization request
            cacheData(clientId, authorizationRequest["scope"]!!, authorizationId, serverRetrievalToken)
    
            val code = Jwt.encode(buildJsonObject {
                put("client_id", authorizationRequest["client_id"])
                put("redirect_uri", authorizationRequest["redirect_uri"])
                put("auth_id", authorizationId)
                put("iat", Timestamp.now().toEpochMilli() / 1000)
                put("exp", (Timestamp.now().toEpochMilli() / 1000) + 600)
                put("sub", authorizationId)
            }, privateKey)
            */
        return "TODO";
    }
}