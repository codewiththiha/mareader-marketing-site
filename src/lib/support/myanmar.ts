// myanmar — local payment methods; mocked until the owner adds live details
export interface LocalMethod {
  id: string;
  name: string;
  kind: "wallet" | "bank";
  initials: string;
  hint: string;
}

export const LOCAL_METHODS: LocalMethod[] = [
  { id: "kbzpay", name: "KBZPay", kind: "wallet", initials: "KBZ", hint: "Scan or send by phone" },
  { id: "wave", name: "Wave Money", kind: "wallet", initials: "W", hint: "Send by phone number" },
  { id: "ayapay", name: "AYA Pay", kind: "wallet", initials: "AYA", hint: "Scan or send by phone" },
  { id: "cbpay", name: "CB Pay", kind: "wallet", initials: "CB", hint: "Send by phone number" },
  {
    id: "bank",
    name: "Bank transfer",
    kind: "bank",
    initials: "฿",
    hint: "AYA · KBZ · CB accounts"
  }
];

export const LOCAL_STATUS = "coming soon";
