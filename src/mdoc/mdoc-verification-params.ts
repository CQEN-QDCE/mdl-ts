import { DeviceAuthentication } from "../mdoc-auth/device-authentication"
import { MDocRequest } from "../mdoc-request"
import { VerificationType } from "./verification-type.enum";

export class MDocVerificationParams {
    verificationTypes: VerificationType[] = [];
    issuerKeyID: string = null;
    deviceKeyID: string = null;
    ephemeralMacKey: ArrayBuffer = null;
    deviceAuthentication: DeviceAuthentication = null;
    mDocRequest: MDocRequest = null;
}