  // @/schemas/actions-schema.ts
  import { z } from "zod";

  export const GlobalActionTypeEnum = z.enum([
    "NAVIGATION_PUSH",
    "FORM_SUBMIT",
    "MODAL_OPEN",
    "CART_ADD",
    "AUTH_LOGOUT",
    "UI_TOGGLE",
    "SCAN_BARCODE"
  ]);

  export type GlobalActionType = z.infer<typeof GlobalActionTypeEnum>;