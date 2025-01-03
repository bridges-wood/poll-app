type Booleanish = boolean | 'true' | 'false';
export function dataAttr(condition: boolean | undefined) {
  return (condition ? 'true' : undefined) as Booleanish;
}

type Extractable =
  | {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }
  | undefined;

export function objectToDeps(obj: Extractable) {
  if (!obj || typeof obj !== 'object') {
    return '';
  }

  try {
    return JSON.stringify(obj);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return '';
  }
}
