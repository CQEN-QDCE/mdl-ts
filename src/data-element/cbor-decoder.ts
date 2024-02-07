import * as CBOR from 'cbor';
import { NullElement } from './null-element';
import { MapKey } from './map-key';
import { MapElement } from './map-element';
import { CborDataItem } from './cbor-data-item';
import { ListElement } from './list-element';
import { ByteStringElement } from './byte-string-element';
import { StringElement } from './string-element';
import { EncodedCBORElement } from './encoded-cbor-element';
import { NumberElement } from './number-element';
import { BooleanElement } from './boolean-element';
import { FullDateElement } from './full-date-element';
import { TDateElement } from './tdate-element';
import { Hex } from '../utils/hex';
import { COSESign1 } from '../cose/cose-sign-1';
import { MobileSecurityObject } from '../mdoc/mobile-security-object';
import { CborEncoder } from './cbor-encoder';
import { Cbor } from '../cbor/cbor';

export class CborDecoder {

    static decode(cborData: ArrayBuffer): CborDataItem {
        const value = CBOR.decodeFirstSync(cborData);
        return CborDecoder.deserialize(value);
    }

    private static deserialize(object: any): CborDataItem {
        if (Array.isArray(object)) {
            const list: CborDataItem[] = [];
            for (const value of object) list.push(CborDecoder.deserialize(value));
            return new ListElement(list);
        } else if (typeof object === 'boolean' || object instanceof Boolean) {
            return new BooleanElement(<boolean>object);
        } else if (typeof object === 'number' || object instanceof Number) {
            return new NumberElement(<number>object);
        } else if (typeof object === 'string' || object instanceof String) {
            return new StringElement(object.toString());
        } else if (object === null) {
            return new NullElement();
        } else if (object instanceof Buffer) {
            return new ByteStringElement(new Int8Array(object).buffer);
        } else if (object instanceof ArrayBuffer) {
            return new ByteStringElement(object);
        } else if (object instanceof Map) {
            const map = new Map<MapKey, CborDataItem>();
            for (const [key, value] of object.entries()) {
                map.set(new MapKey(key), CborDecoder.deserialize(value));
            }
            return new MapElement(map);
        } else {
            if (object.tag === 24) { // ENCODED_CBOR = 24L
                if (object.value instanceof ArrayBuffer || object.value instanceof Buffer) return new EncodedCBORElement(object.value);

                // TODO: Patch pour pyMDOC-CBOR
                let test = CborDecoder.deserialize(object.value);
                return new EncodedCBORElement(CborEncoder.encode(test));
            } else if (object.tag === 61) { // CBOR Web Token (CWT) = 61L
                return <ListElement>CborDecoder.deserialize(object.value)
            } else if (object.tag === 0 || object.tag === 1) { // Cbor TDATE = 0L or TIME = 1L
                throw new Error("Not implemented");
            } else if (object.tag === 18) { // COSE_SIGN1 = 18L
                const list: CborDataItem[] = []
                list.push(new ByteStringElement(object.value[0]));
                const map = new Map<MapKey, CborDataItem>();
                map.set(new MapKey(33), new ByteStringElement(object.value[1].get(33)));
                list.push(new MapElement(map));
                list.push(new ByteStringElement(object.value[2]));
                list.push(new ByteStringElement(object.value[3]));
                let message = Cbor.fromDataItem(new ListElement(list), COSESign1);
                let payload = message.payload;
                let test = CborDecoder.decode(payload);
                let mso = MobileSecurityObject.fromMapElement(<MapElement>test);
                throw new Error("Not implemented");
            } else if (object.tag === 1004 || object.tag === 100) { // Cbor FULL_DATE_STR = 1004L or FULL_DATE_INT = 100L
                return this.deserializeFullDate(object, object.tag);
            } else if (object !== null && new Date(object) instanceof Date && !isNaN(new Date(object).valueOf())) {
                return new TDateElement(new Date(object));
            } else {
                const map = new Map<MapKey, CborDataItem>();
                if (object.attribute && object.attribute.type === 8 && object._value && object._value instanceof Map) { // TODO: What this type?
                    object = object._value;
                }
                for (const [key, value] of Object.entries(object)) {
                    map.set(new MapKey(key), CborDecoder.deserialize(value));
                }
                return new MapElement(map);
            }
        }
        throw new Error("Not implemented");
    }

    static fromCBORHex(encoded: string): CborDataItem {
        const buffer = Hex.decode(encoded);
        return CborDecoder.decode(buffer);
    }

    private static deserializeFullDate(object: any, tag: number): FullDateElement {
        switch (tag) {
            case 1004: {
                const dateParts = object.value.split('T')[0].split('-');
                const timeParts = [];
                const year = parseInt(dateParts[0]);
                // Months are 0-based in JavaScript
                const month = parseInt(dateParts[1]) - 1; 
                const day = parseInt(dateParts[2]);
                const hour = timeParts.length > 0 ? parseInt(timeParts[0]) : 0;
                const minute = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
                const second = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
                return new FullDateElement(new Date(year, month, day, hour, minute, second, 0), CborDataItem.FullDateMode.full_date_str);
            }
            case 100: {
                return new FullDateElement(new Date(object.value), CborDataItem.FullDateMode.full_date_int);
            }
            default:
                throw new Error("Not implemented");
        }
    }
}
