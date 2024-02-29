import * as CBOR from 'cbor';
import { CborNil } from './types/cbor-nil';
import { MapKey } from '../data-element/map-key';
import { MapElement } from '../data-element/map-element';
import { CborDataItem } from './cbor-data-item';
import { CborByteString } from './types/cbor-byte-string';
import { CborTextString } from './types/cbor-text-string';
import { CborEncodedDataItem } from './types/cbor-encoded-data-item';
import { CborNumber } from './types/cbor-number';
import { CborBoolean } from './types/cbor-boolean';
import { CborFullDate } from '../data-element/cbor-full-date';
import { TDateElement } from '../data-element/tdate-element';
import { COSESign1 } from '../cose/cose-sign-1';
import { MobileSecurityObject } from '../mdoc/mobile-security-object';
import { CborEncoder } from './cbor-encoder';
import { CborArray } from '../data-element/cbor-array';

export class CborDecoder {

    static decode(cborData: ArrayBuffer): CborDataItem {
        const value = CBOR.decodeFirstSync(cborData);
        return CborDecoder.deserialize(value);
    }

    private static deserialize(object: any): CborDataItem {
        if (Array.isArray(object)) {
            const list: CborDataItem[] = [];
            for (const value of object) list.push(CborDecoder.deserialize(value));
            return new CborArray(list);
        } else if (typeof object === 'boolean' || object instanceof Boolean) {
            return new CborBoolean(<boolean>object);
        } else if (typeof object === 'number' || object instanceof Number) {
            return new CborNumber(<number>object);
        } else if (typeof object === 'string' || object instanceof String) {
            return new CborTextString(object.toString());
        } else if (object === null) {
            return new CborNil();
        } else if (object instanceof Buffer) {
            return new CborByteString(new Int8Array(object).buffer);
        } else if (object instanceof ArrayBuffer) {
            return new CborByteString(object);
        } else if (object instanceof Map) {
            const map = new Map<MapKey, CborDataItem>();
            for (const [key, value] of object.entries()) {
                map.set(new MapKey(key), CborDecoder.deserialize(value));
            }
            return new MapElement(map);
        } else {
            if (object.tag === 24) { // ENCODED_CBOR = 24L
                if (object.value instanceof ArrayBuffer || object.value instanceof Buffer) return new CborEncodedDataItem(object.value);

                // TODO: Patch pour pyMDOC-CBOR
                let test = CborDecoder.deserialize(object.value);
                return new CborEncodedDataItem(CborEncoder.encode(test));
            } else if (object.tag === 61) { // CBOR Web Token (CWT) = 61L
                return <CborArray>CborDecoder.deserialize(object.value)
            } else if (object.tag === 0 || object.tag === 1) { // Cbor TDATE = 0L or TIME = 1L
                throw new Error("Not implemented");
            } else if (object.tag === 18) { // COSE_SIGN1 = 18L
                const list: CborDataItem[] = []
                list.push(new CborByteString(object.value[0]));
                const map = new Map<MapKey, CborDataItem>();
                map.set(new MapKey(33), new CborByteString(object.value[1].get(33)));
                list.push(new MapElement(map));
                list.push(new CborByteString(object.value[2]));
                list.push(new CborByteString(object.value[3]));
                let message = CborDataItem.to(COSESign1, new CborArray(list));
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

    private static deserializeFullDate(object: any, tag: number): CborFullDate {
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
                return new CborFullDate(new Date(year, month, day, hour, minute, second, 0), CborDataItem.FullDateMode.string);
            }
            case 100: {
                return new CborFullDate(new Date(object.value), CborDataItem.FullDateMode.integer);
            }
            default:
                throw new Error("Not implemented");
        }
    }
}
