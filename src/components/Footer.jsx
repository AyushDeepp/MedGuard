import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>MedGuard</h3>
          <p>Ensuring your safety with authentic medication verification</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/medicine-details">Medicine Details</a></li>
            <li><a href="/fake-detection">Fake Detection</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: info@medguard.com</p>
          <p>Phone: +91 1234567890</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MedGuard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;