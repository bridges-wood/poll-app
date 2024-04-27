interface QueryWrapperProps {
  skeleton?: boolean;
}

type QueryWrappedProps<T = any> = {
  skeleton?: boolean;
} & Partial<T>;
