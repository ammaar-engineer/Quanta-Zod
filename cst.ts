import { oz_initiate } from "./zod-mini.ts"

export const complexSecurity = new oz_initiate({
    // Basic
    type:        (raw, expected) => typeof raw === expected,

    // Number checks
    isEven:      (raw, _) => raw % 2 === 0,
    isPositive:  (raw, _) => raw > 0,
    isDivisible: (raw, expected) => raw % expected === 0,
    inRange:     (raw, expected) => raw >= expected[0] && raw <= expected[1],
})