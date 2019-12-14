export interface TestObj<T> {
  val: T;
}

export interface DeepTestObj<T> {
  a?: {
    b: T[] | null;
  };
}
