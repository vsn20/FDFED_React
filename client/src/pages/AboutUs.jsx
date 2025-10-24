import React from 'react';
import './AboutUs.css'; // Corrected import to match CSS file name

const AboutUs = () => {
  return (
    <>
      <section id="AboutUs">
        {/* ... (container, image-text-section, relationship-section) ... */}
        {/* Keep all the existing sections above this line */}

        <div className="relationship-section">
          <h2>Our Customer-Company Relationship</h2>
          <div className="relationship-grid">
            {/* ... (All 4 relationship-card divs) ... */}
            <div className="relationship-card">
              <i className="fas fa-handshake"></i>
              <h3>Trust & Transparency</h3>
              <p>
                We value your trust above all. With over 95% customer satisfaction ratings and clear communication, we ensure you’re informed and confident in every purchase. Our no-hidden-fees policy and honest product descriptions reflect our commitment to transparency.
              </p>
            </div>
            <div className="relationship-card">
              <i className="fas fa-users"></i>
              <h3>Community Focus</h3>
              <p>
                Our customers are our community. We've served over 50,000 happy households, hosting annual customer appreciation events and offering loyalty discounts to our returning clients. Your feedback shapes our future innovations.
              </p>
            </div>
            <div className="relationship-card">
              <i className="fas fa-tools"></i>
              <h3>Support & Service</h3>
              <p>
                We're here for you long after the sale. Our 24/7 support team handles over 1,000 inquiries monthly, and our in-store service centers have repaired over 10,000 appliances, ensuring your investment lasts.
              </p>
            </div>
            <div className="relationship-card">
              <i className="fas fa-heart"></i>
              <h3>Personalized Care</h3>
              <p>
                Every customer matters. With personalized consultations available in-store and a dedicated account manager for bulk purchases, we’ve helped 80% of our clients find the perfect appliance for their unique needs.
              </p>
            </div>
          </div>
        </div>

        {/* --- UPDATED TEAM SECTION --- */}
        <div className="team-section">
          <h2>Meet Our Team</h2>
          {/* Replaced 'relationship-grid' with 'team-grid-container' */}
          <div className="team-grid-container">
            
            {/* --- Row 1 --- */}
            <div className="team-row">
              <div className="team-card">
                <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Sai Chand" />
                <h3>Sai Chand</h3>
              </div>
              
              <div className="team-card">
                <img src="https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Naman" />
                <h3>Naman</h3>
              </div>
              
              <div className="team-card">
                <img src="https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Hema Sai" />
                <h3>Hema Sai</h3>
              </div>
            </div>

            {/* --- Row 2 --- */}
            <div className="team-row">
              <div className="team-card">
                <img src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Narayana" />
                <h3>Narayana</h3>
              </div>
              
              <div className="team-card">
                <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Jahnavi" />
                <h3>Jahnavi</h3>
              </div>
            </div>

          </div>
        </div>

      </section>
    </>
  );
};

export default AboutUs;