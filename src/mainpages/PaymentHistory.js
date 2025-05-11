import React, { useState, useEffect } from 'react';
import { 
  Elements, 
  PaymentElement, 
  CardElement,
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './PaymentHistory.css';

// Mock a stripePromise
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
const PRICE_ID = 'price_1abc123def456';

// Custom styling for the card element
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#e4e4e4',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // This is a simulated payment process - no actual API calls
      // In a real implementation, this would communicate with your backend
      setTimeout(() => {
        setSucceeded(true);
        setError(null);
        setProcessing(false);
        
        // Simulate redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/payment-success';
        }, 2000);
      }, 1500);
    } catch (err) {
      setError('An unexpected error occurred.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="card-element">Credit or debit card</label>
        <div className="card-element-container">
          <CardElement 
            id="card-element"
            options={CARD_ELEMENT_OPTIONS}
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={!stripe || processing || succeeded}
        className="pay-button"
      >
        {processing ? "Processing..." : succeeded ? "Payment Complete!" : "Subscribe Now"}
      </button>
      
      {error && <div className="card-error">{error}</div>}
      {succeeded && <div className="payment-success">Payment successful! Redirecting to success page...</div>}
      
      <div className="test-card-info">
        <p>💡 Test Card: 4242 4242 4242 4242</p>
        <p>Any future expiration date, any 3-digit CVC, any postal code</p>
      </div>
    </form>
  );
};

const PaymentHistory = () => {
  const [showPaymentForm, setShowPaymentForm] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with mock transaction data
  useEffect(() => {
    setTransactions([
      {
        id: 'tx_' + Math.random().toString(36).substring(2, 11),
        date: '4/11/2025',
        description: 'StudyUp Premium Subscription',
        amount: '9.99',
        status: 'Success'
      }
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="payment-history-container">
      <h1>Payment History</h1>
      
      <div className="subscription-status">
        <h2>Current Subscription</h2>
        <p>Premium Plan - $9.99/month</p>
        <button 
          className="make-payment-button"
          onClick={() => setShowPaymentForm(!showPaymentForm)}
        >
          {showPaymentForm ? "Hide Payment Form" : "Subscribe Now"}
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>

      {showPaymentForm && (
        <div className="payment-form-container">
          <h2>Complete Subscription</h2>
          <p>Enter your payment details below to subscribe to StudyUp Premium.</p>
          
          <Elements stripe={stripePromise}>
            <PaymentForm />
          </Elements>
        </div>
      )}

      <div className="transactions-container">
        <h2>Recent Transactions</h2>
        <div className="transactions-list">
          {loading ? (
            <div>Loading transactions...</div>
          ) : transactions.length > 0 ? (
            transactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-date">{transaction.date}</div>
                <div className="transaction-description">{transaction.description}</div>
                <div className="transaction-amount">${transaction.amount}</div>
                <div className={`transaction-status ${transaction.status.toLowerCase()}`}>
                  {transaction.status}
                </div>
              </div>
            ))
          ) : (
            <div className="no-transactions">No transactions found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;