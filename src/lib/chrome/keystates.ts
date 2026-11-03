/** Key rotation states: requests take turns, one rests, one is set aside. */
export interface KeyRowState {
  id: string;
  status: string;
  tone?: "use" | "rest" | "bad";
}

export function keyStates(t: number): { rows: KeyRowState[]; using: number } {
  const p = t % 16;
  const resting = p < 8;
  const using = resting ? p % 2 : (p - 8) % 3;
  const rows: KeyRowState[] = [
    { id: "sk-proj-••••a1F9", status: "Ready" },
    { id: "sk-proj-••••7Qx2", status: "Ready" },
    resting ? { id: "sk-proj-••••Lm3k", status: `Resting, ${(8 - p) * 3} s`, tone: "rest" } : { id: "sk-proj-••••Lm3k", status: "Ready" },
    { id: "sk-proj-••••Zt0p", status: "Set aside: invalid key", tone: "bad" },
  ];
  rows[using] = { ...rows[using], status: "In use", tone: "use" };
  return { rows, using };
}
