# Security Skill

## General Security
- Never expose secret keys
- Use environment variables correctly
- Validate user input
- Avoid trusting client-side checks alone

## Supabase Security
- Use Row Level Security
- Restrict admin actions properly
- Separate public and private access
- Never expose service role keys

## Auth Security
- Protect admin routes
- Use role-based permissions
- Check permissions before sensitive actions

## Payment Security
- Keep Stripe secret keys server-side
- Validate webhooks
- Never trust payment status from the client alone

## Reliability
- Handle errors clearly
- Avoid leaking sensitive error details
- Test important user flows
