/** Cheap device hints so the reel can shed paint weight on weaker machines. */
const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

export const cores: number = nav.hardwareConcurrency;
export const memory = nav.deviceMemory ?? 8;

/** True when the machine is likely to struggle with big paints. */
export const lite = (nav.connection?.saveData ?? false) || cores <= 4 || memory <= 4;
