import { useEffect, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const OrderShow = ({ order, currentUser, clientSecret }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [minLeft, setMinLeft] = useState(0);
  const [secLeft, setSecLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt).getTime() - Date.now();
      setTimeLeft(Math.round(msLeft / 1000));
      setSecLeft(Math.round(msLeft / 1000) % 60);
      setMinLeft(Math.trunc(Math.round(msLeft / 1000) / 60));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      <div>
        <h2>
          Purchase Order for <emph>{order.ticket.title}</emph>
        </h2>
        <p>
          You have <span style={{ color: 'red' }}>{minLeft}</span> minutes{' '}
          <span style={{ color: 'red' }}>{secLeft}</span> seconds left to
          complete this order
        </p>
      </div>

      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data: orderData } = await client.get(`/api/orders/${orderId}`);
  const { data: sessionData } = await client.post('/api/payments/sessions', {
    orderId
  });

  return { order: orderData, clientSecret: sessionData.clientSecret };
};

export default OrderShow;
