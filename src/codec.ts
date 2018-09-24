export interface Codec<T> {
  /**
   * Creates a new instance.
   * @param obj the object this Codec is based on.
   */
  create(obj?: any[]): T

  /**
   * Returns an object from the array.
   * @param bytes the array to be used for decoding.
   */
  decode(bytes: Uint8Array): T

  /**
   * Returns a Buffer representing the encoded object.
   * @param obj the object to encode.
   */
  encode(obj: T): Uint8Array

  /**
   * Determines if a given object is a valid representation of T.
   * @param obj
   */
  isValid(obj: any[]): boolean
}
