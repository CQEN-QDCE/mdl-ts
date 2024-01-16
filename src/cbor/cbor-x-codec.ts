import { addExtension, Encoder, decode, encode } from 'cbor-x';
import { CborCodec } from './cbor-codec';

export class CborXCodec implements CborCodec {

    encode(value: any): ArrayBuffer {
        return encode(value);
    }

    decode(value: ArrayBuffer): any {
        return decode(new Uint8Array(value));
    }

//    bla(): void {
//        addExtension(Encoder);
//    }

}