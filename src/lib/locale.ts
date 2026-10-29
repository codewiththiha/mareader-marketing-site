/**
 * A guess at the reader's country, made from what the browser already knows.
 * Nothing is sent anywhere to find it out — no IP lookup, no geo API — because a
 * reader page has no business phoning home. docs/donations.md § The two views.
 */

export type LocalGuess = 'myanmar' | 'elsewhere' | 'unknown';

export function guessLocale(): LocalGuess {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';

  if (/^Asia\/(Yangon|Rangoon)$/i.test(zone)) return 'myanmar';
  if (languages.some((tag) => /^my([-_]|$)/i.test(tag))) return 'myanmar';
  if (!zone && languages.every((tag) => !tag)) return 'unknown';
  return 'elsewhere';
}
