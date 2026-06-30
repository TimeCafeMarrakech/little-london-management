# UAT Fix 001 - Login Language Selector Layout

## Summary

Fixed the Premium Login page language selector positioning issue found during User Acceptance Testing.

The language selector was partially clipped at the top-right corner on the login page. It has been moved further inside the login card and given a safe stacking layer so it remains fully visible on desktop.

## Files Modified

- `components/auth/play-learn-auth.tsx`
- `docs/UAT_FIX_001_LOGIN_LANGUAGE_SELECTOR.md`

## What Changed

- Adjusted the `LanguagePill` top position from `top-12` to `top-20`.
- Added `z-30` to keep the selector above decorative card elements.
- Preserved the existing Premium Boutique Dashboard v3 styling.
- Preserved responsive behaviour.

## Scope Confirmation

No changes were made to:

- Authentication logic
- Language functionality
- Routes
- RBAC
- Database
- Business logic

## Command Results

| Command | Result |
| --- | --- |
| `npm.cmd run lint` | Passed |
| `npm.cmd run type-check` | Passed |
| `npm.cmd run build` | Passed |

## Status

UAT Fix 001 is complete.
