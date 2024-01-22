export enum CoseAlgorithm {
    // HMAC
    HMAC256 = 5,
    HMAC384 = 6,
    HMAC512 = 7,
    // ECDSA with SHA-size
    ES256 = -7,
    ES384 = -35,
    ES512 = -36,
    // RSASSA-PSS with SHA-size
    PS256 = -37,
    PS384 = -38,
    PS512 = -39,
    // RSASSA-PKCS1-v1_5 with SHA-size
    RS256 = -257,
    RS384 = -258,
    RS512 = -259,
    // RSASSA-PKCS1-v1_5 using SHA-1
    RS1 = -65535  
}