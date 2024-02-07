import cbor, { Tagged } from 'cbor';
import { MapElement } from './map-element';
import { CborDataItem } from './cbor-data-item';
import { ListElement } from './list-element';
import { MapKeyType } from './map-key-type.enum';
import { EncodedCBORElement } from './encoded-cbor-element';
import { TDateElement } from './tdate-element';

export class CborEncoder {

    static encode(dataItem: CborDataItem): ArrayBuffer {
        const object: unknown = CborEncoder.convertToPlainObject(dataItem);
        return cbor.encode(object);
    }

    private static convertToPlainObject(dataItem: CborDataItem): any {
        if (dataItem instanceof MapElement) {
            return CborEncoder.convertToMap(dataItem);
        } else if (dataItem instanceof ListElement) {
            return CborEncoder.convertToArray(dataItem);
        } else if (dataItem instanceof EncodedCBORElement) {
            return new EncodedCBOR(dataItem.value);
        } else if (dataItem instanceof TDateElement) {
            return new TDate(dataItem.value);
        } else {
            return dataItem.value;
        }
    }

    private static convertToMap(cborMap: MapElement): Map<string | number, any> {
        const map = new Map<string | number, any>();
        for (const [mapKey, dataElement] of cborMap.value) {
            if (dataElement === null) continue;
            if (mapKey.type == MapKeyType.string) map.set(mapKey.str, CborEncoder.convertToPlainObject(dataElement));
            if (mapKey.type == MapKeyType.int) map.set(mapKey.int, CborEncoder.convertToPlainObject(dataElement));
        }
        return map;
    }

    private static convertToArray(listElement: ListElement): any[] {
        const array: any[] = [];
        for (const dataElement of listElement.value) {
            array.push(CborEncoder.convertToPlainObject(dataElement));
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
