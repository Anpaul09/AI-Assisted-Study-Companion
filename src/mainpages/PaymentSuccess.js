import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import { FaHome } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your subscription.</p>
        <div className="button-container">
          <button 
            onClick={() => navigate('/Dashboard')}
            className="home-button"
          >
            <FaHome /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 