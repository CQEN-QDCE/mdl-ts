import { DataElement } from "../data-element/data-element";

export interface CborDataItemConvertible {

  fromCborDataItem(dataItem: DataElement): object;

  toCborDataItem(): DataElement;
  
}