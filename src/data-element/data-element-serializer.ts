import cbor, { Tagged } from 'cbor';
import { MapElement } from './map-element';
import { DataElement } from './data-element';
import { ListElement } from './list-element';
import { MapKeyType } from './map-key-type.enum';
import { EncodedCBORElement } from './encoded-cbor-element';
import { TDateElement } from './tdate-element';

export class DataElementSerializer {

    static toCBOR(dataElement: DataElement): ArrayBuffer {
        const object: unknown = DataElementSerializer.convertToPlainObject(dataElement);
        return cbor.encode(object);
    }

    private static convertToPlainObject(dataElement: DataElement): any {
        if (dataElement instanceof MapElement) {
            return DataElementSerializer.getMapElement(dataElement);
        } else if (dataElement instanceof ListElement) {
            return DataElementSerializer.getListElement(dataElement);
        } else if (dataElement instanceof EncodedCBORElement) {
            return new EncodedCBOR(dataElement.value);
        } else if (dataElement instanceof TDateElement) {
            return new TDate(dataElement.value);
        } else {
            return dataElement.value;
        }
    }

    private static getMapElement(mapElement: MapElement): Map<string | number, any> {
        const map = new Map<string | number, any>();
        for (const [mapKey, dataElement] of mapElement.value) {
            if (dataElement === null) continue;
            if (mapKey.type == MapKeyType.string) map.set(mapKey.str, DataElementSerializer.convertToPlainObject(dataElement));
            if (mapKey.type == MapKeyType.int) map.set(mapKey.int, DataElementSerializer.convertToPlainObject(dataElement));
        }
        return map;
    }

    private static getListElement(listElement: ListElement): any[] {
        const list: any[] = [];
        for (const dataElement of listElement.value) {
            list.push(DataElementSerializer.convertToPlainObject(dataElement));
        }
        return list;
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
