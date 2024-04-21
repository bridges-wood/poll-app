type Booleanish = boolean | 'true' | 'false';
export const dataAttr = (condition: boolean | undefined) =>
  (condition ? 'true' : undefined) as Booleanish;

type Extractable =
  | {
      [key: string]: any;
    }
  | undefined;

export function objectToDeps(obj: Extractable) {
  if (!obj || typeof obj !== 'object') {
    return '';
  }

  try {
    return JSON.stringify(obj);
  } catch (e) {
    return '';
  }
}
