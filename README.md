# Ticketing Application

_This application was created in the context of learning microservices._

## Business Logic

- Users can list a ticker for an event (concert, sports) for sale.
- Other users can purchase the ticket.
- Any user can list tickets for sale and purchase tickets.
- When a user attempts to purchase a ticket, the ticket is locked for 15 minutes
  (The user has 15 minutes to enter their payment info).
- While locked, no other user can purchase the ticket. After 15 minutes, the ticket should unlock.
- Ticket prices can be edited if they are not locked.
