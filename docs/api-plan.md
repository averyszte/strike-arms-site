# API Plan

## Purpose
Define how the frontend communicates with Supabase, Stripe, and any serverless functions.

## Supabase
- Use efficient queries
- Avoid excessive repeated requests
- Use loading and error states
- Keep public and private data access separate

## Stripe
- Use secure server-side payment handling
- Never expose secret keys
- Use webhook validation

## Forms
- Validate user input
- Prevent spam where possible
- Show clear success/error states

## Notes
- Keep API logic organized
- Avoid duplicated request logic
- Document important endpoints/functions
