import { CborDataItem } from "../data-element/cbor-data-item";

export interface CborDataItemConvertable {

  fromCborDataItem(dataItem: CborDataItem): object;

  toCborDataItem(): CborDataItem;
  
}