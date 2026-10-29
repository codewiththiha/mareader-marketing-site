/**
 * One answer to "which system is this?" for the whole page. The hero, the
 * download list and the footer all read it, so they can never disagree.
 */

import {
  detectPlatform,
  refinePlatform,
  platformLabel,
  type Arch,
  type Platform,
} from './platform';

function labelled(platform: Platform): Platform {
  return { ...platform, label: platformLabel(platform) };
}

let current = $state<Platform>(labelled(detectPlatform()));
let started = false;

export const device = {
  get value(): Platform {
    return current;
  },
  get label(): string {
    return current.label;
  },
  /** Asks the browser for the architecture, where it will say. */
  async init(): Promise<void> {
    if (started) return;
    started = true;
    const refined = await refinePlatform(current);
    current = labelled(refined);
  },
  chooseArch(arch: Arch): void {
    // Not `archConfirmed`: that means the browser said so, and would hide this.
    current = labelled({ ...current, arch });
  },
};
