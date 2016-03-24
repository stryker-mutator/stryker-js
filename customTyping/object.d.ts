/**
  * Copy the values of all of the enumerable own properties from one or more source objects to a 
  * target object. Returns the target object.
  * @param target The target object to copy to.
  * @param sources One or more source objects to copy properties from.
  */
interface ObjectConstructor {
  assign(target: any, ...sources: any[]): any;
}
