import React, { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

export default function Return() {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get('session_id');

    fetch(`/api/payments/fulfill?session_id=${sessionId}`, {
      method: 'POST'
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setCustomerEmail(data.customer_email);
      });
  }, []);

  if (status === 'open') {
    return redirect('/');
  }

  if (status === 'complete') {
    return (
      <section id="success">
        <p>Your order has been succesfully completed!</p>
      </section>
    );
  }

  if (status === 'expired') {
    return (
      <div>
        Your order has expired. You must restart the checkout process in order
        to purchase this ticket.
      </div>
    );
  }

  return null;
}
