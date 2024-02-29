import cbor, { Tagged } from 'cbor';
import { CborMap } from '../data-element/cbor-map';
import { CborDataItem } from './cbor-data-item';
import { MapKeyType } from '../data-element/map-key-type.enum';
import { CborEncodedDataItem } from './types/cbor-encoded-data-item';
import { TDateElement } from '../data-element/tdate-element';
import { CborArray } from '../data-element/cbor-array';

export class CborEncoder {

    static encode(dataItem: CborDataItem): ArrayBuffer {
        const object: unknown = CborEncoder.convertToPlainObject(dataItem);
        return cbor.encode(object);
    }

    private static convertToPlainObject(dataItem: CborDataItem): any {
        if (dataItem instanceof CborMap) {
            return CborEncoder.convertToMap(dataItem);
        } else if (dataItem instanceof CborArray) {
            return CborEncoder.convertToArray(dataItem);
        } else if (dataItem instanceof CborEncodedDataItem) {
            return new EncodedCBOR(dataItem.getValue());
        } else if (dataItem instanceof TDateElement) {
            return new TDate(dataItem.getValue());
        } else {
            return dataItem.getValue();
        }
    }

    private static convertToMap(cborMap: CborMap): Map<string | number, any> {
        const map = new Map<string | number, any>();
        for (const [mapKey, dataElement] of cborMap.getValue()) {
            if (dataElement === null) continue;
            if (mapKey.type == MapKeyType.string) map.set(mapKey.str, CborEncoder.convertToPlainObject(dataElement));
            if (mapKey.type == MapKeyType.int) map.set(mapKey.int, CborEncoder.convertToPlainObject(dataElement));
        }
        return map;
    }

    private static convertToArray(cborArray: CborArray): any[] {
        const array: any[] = [];
        for (const cborDataItem of cborArray) {
            array.push(CborEncoder.convertToPlainObject(cborDataItem));
        }
        return array;
    }
}

class EncodedCBOR {
    private value: ArrayBuffer;
    constructor(value: ArrayBuffer) {
      this.value = value;
    }
  
    encodeCBOR(encoder) {
      const tagged = new Tagged(24, this.value);
      return encoder.pushAny(tagged)
    }
}

class TDate {
    private value: Date;
    constructor(value: Date) {
      this.value = value;
    }
  
    encodeCBOR(encoder) {
      const tagged = new Tagged(0, this.value.toISOString());
      return encoder.pushAny(tagged)
    }
}
