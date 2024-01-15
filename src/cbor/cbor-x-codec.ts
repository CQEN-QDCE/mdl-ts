import cbor, { Tagged } from 'cbor';
import { CborCodec } from './cbor-codec';

export class CborXCodec implements CborCodec {

    encode(...objs: any[]): ArrayBuffer {
        return cbor.encode(objs);
    }

    decode(value: ArrayBuffer): any {
        return cbor.decodeFirstSync(value);
    }

}