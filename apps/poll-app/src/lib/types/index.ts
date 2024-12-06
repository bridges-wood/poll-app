export interface QueryWrapperProps {
  skeleton?: boolean;
}

export type QueryWrappedProps<T = never> = {
  skeleton?: boolean;
} & Partial<T>;
