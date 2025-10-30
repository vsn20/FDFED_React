import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <>
      <section id="AboutUs">
        <div className="container">
          <h1>About Electroland</h1>
          <p>
            Welcome to Electroland, where innovation meets quality to transform your home. Since our founding in 2010, we’ve been dedicated to providing top-tier appliances that blend cutting-edge technology with timeless design. Our mission is simple: to enhance your lifestyle with reliable, efficient, and stylish solutions tailored to your needs.
          </p>
        </div>

        <div className="image-text-section">
          <img src="https://cdn.pixabay.com/photo/2017/03/22/17/39/kitchen-2165756_1280.jpg" alt="Our Team" />
          <div className="text-content">
            <h2>Our Journey</h2>
            <p>
              Electroland started as a small family business with a vision to revolutionize home appliances. Over the past decade, we’ve grown into a trusted name, serving thousands of households with our commitment to excellence. Our team of experts works tirelessly to design and curate products that make your daily life easier and more enjoyable.
            </p>
          </div>
        </div>

        <div className="image-text-section image-right">
          <div className="text-content">
            <h2>Our Values</h2>
            <p>
              At the heart of Electroland is a set of core values: integrity, innovation, and customer satisfaction. We believe in building lasting relationships with our customers by offering not just products, but experiences. Every appliance we sell reflects our dedication to quality and our promise to stand by you every step of the way.
            </p>
          </div>
          <img src="/aboutusright.jpg" alt="Our Values" />
        </div>

        <div className="relationship-section">
          <h2>Our Customer-Company Relationship</h2>
          <div className="relationship-grid">
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

        {/* --- TEAM SECTION:*/}
        <div className="team-section">
          <h2 >Meet Our Team</h2>
          <div className="team-grid-container">
            <div className="team-row team-row-2">
              <div className="team-card">
                <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Sai Chand" />
                <h3>Sai Chand</h3>
              </div>
              <div className="team-card">
                <img src="https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Naman" />
                <h3>Vuppala Sai Naman</h3>
              </div>
            </div>
            <div className="team-row team-row-3">
              <div className="team-card">
                <img src="https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Hema Sai" />
                <h3>Hema Sai</h3>
              </div>
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