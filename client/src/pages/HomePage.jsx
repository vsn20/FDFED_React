import React, { useState, useEffect } from 'react';
import './Homepage.css'; // Import the CSS

// Main Home Component
function Home() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [animationCounter, setAnimationCounter] = useState(0);
    const numSlides = 5; // Total number of slides

    // This useEffect hook replicates the JavaScript logic from your EJS file.
    // It updates the current slide every 5 seconds.
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prevSlide => (prevSlide + 1) % numSlides);
            // We update a counter. This will be used as a 'key' to force
            // the slide-text component to re-render and re-animate.
            setAnimationCounter(count => count + 1);
        }, 5000); // 5-second interval matches the CSS animation

        return () => clearInterval(slideInterval); // Cleanup on unmount
    }, []);

    // This helper function creates the slide text.
    // By giving it a unique key that changes (animationCounter),
    // React re-mounts the element, triggering the CSS animation.
    const renderSlideText = (slideIndex, text) => {
        const key = currentSlide === slideIndex ? `slide-${animationCounter}` : `slide-text-${slideIndex}`;
        return (
            <div className="slide-text" key={key}>
                {text}
            </div>
        );
    };

    return (
        <>
            <section id="Home">
                {/* Left Sidebar */}
                <div className="left-sidebar-container">
                    <div className="left-sidebar">
                        <a href="/newproducts" id="new-products-link">New Products</a>
                        <a href="/ourproducts" id="our-products-link">Our Products</a>
                        <a href="/topproducts" id="top-products-link">Top Products</a>
                    </div>
                </div>

                {/* Slideshow */}
                <div className="slideshow-container">
                    <div className="slideshow">
                        <div className="slide">
                            <img src="/IntoHome2.jpg" alt="Slide 1" />
                            {renderSlideText(0, "Welcome to Electroland")}
                        </div>
                        <div className="slide">
                            <img src="/IntoHome.jpg" alt="Slide 2" />
                            {renderSlideText(1, "Discover Top Appliances")}
                        </div>
                        <div className="slide">
                            <img src="/IntoHome3.jpg" alt="Slide 3" />
                            {renderSlideText(2, "Your Stocks In Our Hands")}
                        </div>
                        <div className="slide">
                            <img src="/IntoHome4.jpg" alt="Slide 4" />
                            {renderSlideText(3, "Explore Our Latest Offers")}
                        </div>
                        <div className="slide">
                            <img src="/IntoHome5.jpg" alt="Slide 5" />
                            {renderSlideText(4, "Manage Retail Stocks")}
                        </div>
                    </div>
                </div>

                {/* Image Description Section */}
                <div className="image-description-container">
                    <img src="/shopsmart.jpg" alt="Featured Product" />
                    <div className="description">
                        <h3>Discover Our Top Appliances</h3>
                        <p>At Electroland, we bring you the best in home appliances, designed to make your life easier and more efficient. From state-of-the-art kitchen gadgets to innovative home solutions, our products are built with quality and durability in mind. Explore our wide range of offerings and find the perfect appliance to suit your needs. Shop now and experience the Electroland difference!. Our products are crafted with innovation, quality, and durability in mind, ensuring that every purchase delivers exceptional performance and long-lasting value.</p>
                    </div>
                </div>

                {/* Hero Image Section */}
                <div className="hero-image-container">
                    <img src="https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg" alt="Hero Image" />
                    <div className="hero-overlay-text">
                        <h2>Transform Your Home</h2>
                        <p>Upgrade your living space with our premium appliances and enjoy unmatched quality and style. Visit us today!</p>
                    </div>
                </div>

                {/* Hero Description Section */}
                <div className="hero-description">
                    <img src="/IntoHome6.jpg" alt="Floating Image" />
                    <h3>Elevate Your Lifestyle</h3>
                    <p>Transforming your home starts with choosing the right appliances. At Electroland, we offer a curated selection of products that blend functionality with modern design. Whether you're upgrading your kitchen, laundry, or living spaces, our appliances are engineered to deliver top performance and lasting value. Discover how Electroland can help you create a home that's both beautiful and efficient.</p>
                </div>

                {/* Why Choose Us Section */}
                <div className="why-choose-us">
                    <h2>Why Choose Electroland</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <i className="fas fa-shield-alt"></i>
                            <h3>Unmatched Quality Guarantee</h3>
                            <p>At Electroland, we stand behind every product we sell. All appliances come with a comprehensive 2-year warranty, and our rigorous quality control ensures that each item meets the highest standards of durability and performance. Shop with confidence knowing you're investing in long-lasting solutions for your home.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-microchip"></i>
                            <h3>Innovative Technology</h3>
                            <p>Our appliances feature cutting-edge technology designed to enhance your daily life. From smart controls to energy-saving systems, we integrate the latest advancements to ensure maximum efficiency, convenience, and performance in every product we offer.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-headset"></i>
                            <h3>Exceptional 24/7 Support</h3>
                            <p>Our dedicated customer support team is available around the clock to assist you with any questions or concerns. Whether you need help choosing the right appliance, troubleshooting, or arranging a service, we're here to provide personalized assistance anytime you need it.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fas fa-leaf"></i>
                            <h3>Eco-Friendly Innovation</h3>
                            <p>We’re committed to sustainability. Our appliances are designed with energy-efficient technology to reduce your carbon footprint while saving you money on utility bills. Choose Electroland for environmentally conscious solutions that don’t compromise on performance.</p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-container">
                    <h2 className="reviews-title">What Our Customers Say</h2>
                    <div className="reviews-grid">
                        <div className="review-card">
                            <div className="review-header">
                                <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="Customer" className="review-avatar" />
                                <div className="review-info">
                                    <h3>Sarah Johnson</h3>
                                    <div className="rating">★★★★★</div>
                                </div>
                            </div>
                            <p className="review-text">"The kitchen appliances I bought from Electroland transformed my cooking experience. Top quality and amazing customer service!"</p>
                            <span className="review-date">March 10, 2025</span>
                        </div>
                        
                        <div className="review-card">
                            <div className="review-header">
                                <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="Customer" className="review-avatar" />
                                <div className="review-info">
                                    <h3>Michael Chen</h3>
                                    <div className="rating">★★★★☆</div>
                                </div>
                            </div>
                            <p className="review-text">"Great selection of products and good quality of products. The washing machine works like a dream!"</p>
                            <span className="review-date">March 12, 2025</span>
                        </div>
                        
                        <div className="review-card">
                            <div className="review-header">
                                <img src="https://randomuser.me/api/portraits/women/3.jpg" alt="Customer" className="review-avatar" />
                                <div className="review-info">
                                    <h3>Emily Davis</h3>
                                    <div className="rating">★★★★★</div>
                                </div>
                            </div>
                            <p className="review-text">"Absolutely love my new refrigerator! Energy efficient and stylish - Electroland never disappoints."</p>
                            <span className="review-date">March 14, 2025</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;