import React, { useEffect, useRef } from 'react';
import './AboutUs.css';

/* ── Scroll-reveal hook ─────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ── SVG Icons (no FontAwesome dependency) ──────────────── */
const IconHandshake = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconSupport = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.16 12 19.79 19.79 0 0 1 1.07 3.35 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.93 5.93l1.18-1.18a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const RELATIONSHIP_CARDS = [
  {
    icon: <IconHandshake />,
    title: 'Trust & Transparency',
    text: 'We value your trust above all. With over 95% customer satisfaction ratings and clear communication, we ensure you are informed and confident in every purchase. Our no-hidden-fees policy and honest product descriptions reflect our commitment to transparency.',
  },
  {
    icon: <IconUsers />,
    title: 'Community Focus',
    text: 'Our customers are our community. We ve served over 50,000 happy households, hosting annual customer appreciation events and offering loyalty discounts to our returning clients. Your feedback shapes our future innovations.',
  },
  {
    icon: <IconSupport />,
    title: 'Support & Service',
    text: 'We\'re here for you long after the sale. Our 24/7 support team handles over 1,000 inquiries monthly, and our in-store service centers have repaired over 10,000 appliances, ensuring your investment lasts.',
  },
  {
    icon: <IconHeart />,
    title: 'Personalized Care',
    text: 'Every customer matters. With personalized consultations available in-store and a dedicated account manager for bulk purchases, we have helped 80% of our clients find the perfect appliance for their unique needs.',
  },
];

const TEAM = [
  {
    name: 'Sai Chand',
    img: './saichand.jpg',
    role: 'Company Dashboard, Messaging System, Authentication & Top Products',
  },
  {
    name: 'Vuppala Sai Naman',
    img: './SaiNaman.jpg',
    role: 'Admin Dashboard, Our Branches & Our Products Pages',
  },
  {
    name: 'Hema Sai',
    img: './hema.jpg',
    role: 'Salesman Dashboard & New Products Page',
  },
  {
    name: 'Narayana',
    img: './narayana.jpg',
    role: 'Sales Manager Dashboard & Homepage',
  },
  {
    name: 'Jahnavi',
    img: './jahanavi.png',
    role: 'Customer Dashboard & Contact Us Page',
  },
];

/* ── Main Component ─────────────────────────────────────── */
const AboutUs = () => {
  const heroRef    = useReveal(0.1);
  const introRef   = useReveal(0.15);
  const valuesRef  = useReveal(0.15);
  const relRef     = useReveal(0.1);
  const teamRef    = useReveal(0.1);

  /* Stagger individual cards */
  const cardRefs = useRef([]);
  const teamCardRefs = useRef([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    [...cardRefs.current, ...teamCardRefs.current].forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="au-root">

      {/* ── HERO ── */}
      <section className="au-hero">
        <div className="au-hero__bg" />
        <div className="au-hero__overlay" />
        <div className="au-hero__content" ref={heroRef}>
          <div className="au-hero__overline">Electroland — Est. 2020</div>
          <h1 className="au-hero__title">
            About <em>Electroland</em>
          </h1>
          <p className="au-hero__sub">
            Where innovation meets quality — transforming homes with premium appliances built to last.
          </p>
        </div>
      </section>

      {/* ── INTRO / OUR JOURNEY ── */}
      <section className="au-intro" ref={introRef}>
        <div className="au-intro__inner">
        <div className="au-intro__img-wrap">
          <img
            src="https://cdn.pixabay.com/photo/2017/03/22/17/39/kitchen-2165756_1280.jpg"
            alt="Electroland journey"
            className="au-intro__img"
          />
          <div className="au-intro__badge">Est. 2020</div>
        </div>
        <div className="au-intro__body">
          <div className="au-tag">Who We Are</div>
          <h2 className="au-title">
            Our <em>Journey</em>
          </h2>
          <p className="au-intro__text">
            Electroland started as a small family business with a vision to revolutionize home appliances. Over the years, we've grown into a trusted name, serving thousands of households with our commitment to excellence.
          </p>
          <p className="au-intro__text">
            Our team of experts works tirelessly to design and curate products that make your daily life easier and more enjoyable — blending cutting-edge technology with timeless design.
          </p>
          <div className="au-intro__divider" />
          <a href="/ourproducts" className="au-btn au-btn--amber">Explore Our Products →</a>
        </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="au-split au-split--reversed" ref={valuesRef}>
        <div className="au-split__inner">
        <div className="au-split__body">
          <div className="au-tag">What We Stand For</div>
          <h2 className="au-title">
            Our <em>Values</em>
          </h2>
          <p className="au-split__text">
            At the heart of Electroland is a set of core values: integrity, innovation, and customer satisfaction. We believe in building lasting relationships with our customers by offering not just products, but experiences.
          </p>
          <p className="au-split__text" style={{ marginTop: '16px' }}>
            Every appliance we sell reflects our dedication to quality and our promise to stand by you every step of the way — from selection to installation to after-care.
          </p>
        </div>
        <div className="au-split__img-wrap">
          <img
            src="/aboutusright.jpg"
            alt="Our Values"
            className="au-split__img"
          />
        </div>
        </div>
      </section>

      {/* ── RELATIONSHIP GRID ── */}
      <section className="au-relationship" ref={relRef}>
        <div className="au-relationship__inner">
        <div className="au-relationship__header">
          <div className="au-tag" style={{ justifyContent: 'center' }}>Our Promise</div>
          <h2 className="au-title" style={{ textAlign: 'center' }}>
            Customer &amp; <em>Company</em>
          </h2>
        </div>
        <div className="au-relationship__grid">
          {RELATIONSHIP_CARDS.map((card, i) => (
            <div
              key={i}
              className="au-rel-card"
              ref={(el) => (cardRefs.current[i] = el)}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="au-rel-card__icon">{card.icon}</div>
              <h3 className="au-rel-card__title">{card.title}</h3>
              <p className="au-rel-card__text">{card.text}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="au-team" ref={teamRef}>
        <div className="au-team__inner">
        <div className="au-team__header">
          <div className="au-tag" style={{ justifyContent: 'center' }}>The People Behind It</div>
          <h2 className="au-title" style={{ textAlign: 'center' }}>
            Meet Our <em>Team</em>
          </h2>
        </div>
        <div className="au-team__rows">
          {/* Row 1: first 2 */}
          <div className="au-team__row">
            {TEAM.slice(0, 2).map((member, i) => (
              <div
                key={i}
                className="au-team-card"
                ref={(el) => (teamCardRefs.current[i] = el)}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="au-team-card__avatar-wrap">
                  <img src={member.img} alt={member.name} className="au-team-card__avatar" />
                </div>
                <div className="au-team-card__name">{member.name}</div>
                <div className="au-team-card__role">{member.role}</div>
              </div>
            ))}
          </div>
          {/* Row 2: last 3 */}
          <div className="au-team__row">
            {TEAM.slice(2).map((member, i) => (
              <div
                key={i}
                className="au-team-card"
                ref={(el) => (teamCardRefs.current[i + 2] = el)}
                style={{ transitionDelay: `${(i + 2) * 0.1}s` }}
              >
                <div className="au-team-card__avatar-wrap">
                  <img src={member.img} alt={member.name} className="au-team-card__avatar" />
                </div>
                <div className="au-team-card__name">{member.name}</div>
                <div className="au-team-card__role">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;