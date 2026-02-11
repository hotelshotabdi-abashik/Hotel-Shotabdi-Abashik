
import React from 'react';

const SchemaOrg: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Hotel Shotabdi Residential",
    "description": "Premium luxury residential hotel in Sylhet, Bangladesh. Offering AC rooms, free WiFi, and 24/7 service.",
    "url": "https://hotelshotabdiabashik.com",
    "telephone": "+8801717425702",
    "priceRange": "৳1000 - ৳5000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kumargaon Bus Terminal",
      "addressLocality": "Sylhet",
      "addressRegion": "Sylhet Division",
      "postalCode": "3100",
      "addressCountry": "BD"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 24.8917,
      "longitude": 91.8697
    },
    "image": [
      "https://pub-9f3e455c1df04b5b98df165c6987ccca.r2.dev/Logo/shotabdi%20logo.png"
    ],
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Free Wi-Fi", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Air Conditioning", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "24-Hour Front Desk", "value": true }
    ],
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4.5"
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default SchemaOrg;
