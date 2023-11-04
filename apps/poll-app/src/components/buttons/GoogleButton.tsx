'use client';
import _ from 'lodash';
import { useTheme } from 'next-themes';
import Image, { ImageProps } from 'next/image';
import { FC } from 'react';

// See https://developers.google.com/identity/branding-guidelines

const DEFAULT_SHAPE = 'rd';
const DEFAULT_VARIANT = 'ctn';

export interface GoogleButtonProps
  extends Omit<ImageProps, 'src' | 'width' | 'height' | 'alt'> {
  shape?: 'sq' | 'rd';
  variant?: 'ctn' | 'SI' | 'SU' | 'na';
}

const GoogleButton: FC<GoogleButtonProps> = (props) => {
  const { resolvedTheme } = useTheme();

  if (!_.isNil(resolvedTheme)) {
    const derivedProps = deriveProps(props, resolvedTheme);
    return (
      <Image
        alt=""
        {..._.merge(derivedProps, props)}
        className={`${_.defaultTo(
          props.className,
          ''
        )} cursor-pointer hover:opacity-80`}
      />
    );
  }
};

/**
 * Derives the src, width, and height props for the button based on Google's branding guidelines
 * @param props The props passed to the GoogleButton component
 * @param theme The resolved theme from next-themes
 * @returns An object containing the src, width, and height props for the inner Image component
 */
const deriveProps = (
  props: GoogleButtonProps,
  theme: string
): Pick<ImageProps, 'src' | 'width' | 'height'> => {
  const { shape = DEFAULT_SHAPE, variant = DEFAULT_VARIANT } = props;
  const src = `/google/${theme}/web_${theme}_${shape}_${variant}.svg`;

  switch (variant) {
    case 'ctn':
      return {
        src,
        width: 197,
        height: 40,
      };
    case 'SI':
      return {
        src,
        width: 183,
        height: 40,
      };
    case 'SU':
      return {
        src,
        width: 188,
        height: 40,
      };
    case 'na':
      return {
        src,
        width: 40,
        height: 40,
      };
    default:
      throw new Error(`Invalid variant: ${variant}`);
  }
};

export default GoogleButton;
