import safeRegex from 'safe-regex2';

export const MAX_REGEX_PATTERN_LENGTH = 128;
export const ALLOWED_REGEX_FLAGS = ['i', 'm', 's'] as const;

function parseRegexInput(input: string): { pattern: string; flags: string } {
  if (!input.startsWith('/')) {
    return { pattern: input, flags: '' };
  }

  let slashIndex = -1;

  for (let i = input.length - 1; i > 0; i--) {
    if (input[i] !== '/') continue;

    let backslashCount = 0;
    for (let j = i - 1; j >= 0 && input[j] === '\\'; j--) {
      backslashCount++;
    }

    if (backslashCount % 2 === 0) {
      slashIndex = i;
      break;
    }
  }

  if (slashIndex <= 0) {
    return { pattern: input, flags: '' };
  }

  return {
    pattern: input.slice(1, slashIndex),
    flags: input.slice(slashIndex + 1),
  };
}

function validateRegexFlags(flags: string): void {
  const allowedFlags = new Set(ALLOWED_REGEX_FLAGS);
  const seenFlags = new Set<string>();

  for (const flag of flags) {
    if (!allowedFlags.has(flag as (typeof ALLOWED_REGEX_FLAGS)[number])) {
      throw new Error(
        `RegExp flags may only include: ${ALLOWED_REGEX_FLAGS.join(', ')}`,
      );
    }

    if (seenFlags.has(flag)) {
      throw new Error('RegExp flags must not contain duplicates');
    }

    seenFlags.add(flag);
  }
}

export function validateRegexPattern(pattern: string): void {
  if (pattern.length > MAX_REGEX_PATTERN_LENGTH) {
    throw new Error(
      `RegExp pattern must be at most ${MAX_REGEX_PATTERN_LENGTH} characters`,
    );
  }

  if (!safeRegex(pattern)) {
    throw new Error('RegExp pattern is unsafe');
  }
}

export function parseAndValidateRegex(input: string): RegExp {
  const { pattern, flags } = parseRegexInput(input);
  validateRegexPattern(pattern);
  validateRegexFlags(flags);
  return new RegExp(pattern, flags);
}
