# Ticketing Application

_This application was created in the context of learning microservices._

## Business Logic

- Users can sign up, sign in, and sign out of the application.
- Users can list a ticker for an event (concert, sports) for sale.
- Other users can purchase the ticket.
- Any user can list tickets for sale and purchase tickets.
- When a user attempts to purchase a ticket, the ticket is 'locked' for 15 minutes
  (The user has 15 minutes to enter their payment info).
- While 'locked', no other user can purchase the ticket. After 15 minutes, the ticket should 'unlock'.
- The app can handle actual payments.
- Ticket prices can be edited if they are not 'locked'.
- Users can view all tickets are have purchased

### Resources

**User**(_email, password_),
**Ticket**(_title, price, userId, orderId_),
**Order**(_userId, status, ticketId, expiresAt_),
**Charge**(_orderId, status, amount, stripeId, stripeRefund_)

### Services

**auth:** Everything related to user signup/signin/signout
**tickets:** Ticket creation/editing. Knows whether a ticket can be updated
**orders:** Order creation and editing
**expiration:** Watches for orders to be created, cancels them after 15 minutes
**payments:** Handles credit card payments. Cancels orders if payments fail, completes if payments succeed

### Events

|                |               |               |
| -------------- | ------------- | ------------- |
| **UserCreated**    | **UserUpdated**   | **OrderCreated**  |
| **OrderCancelled** | **OrderExpired**  | **TicketCreated** |
| **TicketUpdated**  | **ChargeCreated** |               

### Technologies used

_Node.js, Express, Kubernetes, Docker, Google Cloud, Next.js, mongodb, Redis, NATS Streaming Server_
