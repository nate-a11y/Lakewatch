// Seed data for Lake Watch Pros CMS collections
// This data can be imported via the Payload admin or through a seed script

export const servicesData = [
  {
    name: 'Home Watch Inspections',
    slug: 'home-watch-inspections',
    shortDescription: 'Regular property inspections to catch issues before they become costly problems.',
    icon: 'eye',
    featured: true,
    order: 1,
    pricingTiers: [
      { name: 'Under 2,000 sq ft', perVisit: '$50', monthly1x: '$45/mo', monthly2x: '$80/mo', monthly4x: '$150/mo' },
      { name: '2,000 - 4,000 sq ft', perVisit: '$65', monthly1x: '$60/mo', monthly2x: '$110/mo', monthly4x: '$200/mo' },
      { name: '4,000 - 6,500 sq ft', perVisit: '$85', monthly1x: '$80/mo', monthly2x: '$150/mo', monthly4x: '$280/mo' },
      { name: 'Over 6,500 sq ft', perVisit: '$110+', note: 'Custom quote required' },
    ],
    features: [
      { feature: 'Interior and exterior visual inspection' },
      { feature: 'HVAC system operation check' },
      { feature: 'Plumbing inspection for leaks' },
      { feature: 'Electrical system check' },
      { feature: 'Security system verification' },
      { feature: 'Appliance operation test' },
      { feature: 'Pest and rodent inspection' },
      { feature: 'Detailed photo documentation' },
      { feature: 'Same-day digital report' },
    ],
  },
  {
    name: 'Pre-Arrival Preparation',
    slug: 'pre-arrival-preparation',
    shortDescription: 'Your home is ready and waiting when you arrive—climate set, lights on, everything perfect.',
    icon: 'home',
    featured: true,
    order: 2,
    pricingTiers: [
      { name: 'Standard', flatRate: '$75 - $150', note: 'Based on home size' },
    ],
    features: [
      { feature: 'Climate control adjustment' },
      { feature: 'Lights and electronics on' },
      { feature: 'Fresh linens (upon request)' },
      { feature: 'General cleaning coordination' },
      { feature: 'Hot tub/pool preparation' },
      { feature: 'Dock and boat lift check' },
      { feature: 'Grocery stocking available' },
      { feature: 'Mail and package collection' },
    ],
  },
  {
    name: 'Post-Departure Closing',
    slug: 'post-departure-closing',
    shortDescription: 'Leave worry-free knowing your home is properly secured and protected.',
    icon: 'key',
    featured: false,
    order: 3,
    pricingTiers: [
      { name: 'Standard', flatRate: '$75 - $150', note: 'Based on home size' },
    ],
    features: [
      { feature: 'Complete walk-through inspection' },
      { feature: 'Climate adjustment for vacancy' },
      { feature: 'All entry points secured' },
      { feature: 'Appliances turned off' },
      { feature: 'Trash and recycling removal' },
      { feature: 'Water shut-off (seasonal)' },
      { feature: 'Security system armed' },
      { feature: 'Digital confirmation report' },
    ],
  },
  {
    name: 'Storm & Weather Checks',
    slug: 'storm-weather-checks',
    shortDescription: 'Immediate property assessment after severe weather to identify and address damage.',
    icon: 'cloud-lightning',
    featured: true,
    order: 4,
    pricingTiers: [
      { name: 'Per Check', flatRate: '$60' },
    ],
    features: [
      { feature: 'Rapid response after severe weather' },
      { feature: 'Exterior damage assessment' },
      { feature: 'Interior water intrusion check' },
      { feature: 'Roof and gutter inspection' },
      { feature: 'Window and door seal check' },
      { feature: 'Dock and waterfront assessment' },
      { feature: 'Emergency repairs coordination' },
      { feature: 'Insurance documentation photos' },
    ],
  },
  {
    name: 'Contractor Coordination',
    slug: 'contractor-coordination',
    shortDescription: 'We serve as your on-site representative, meeting contractors and ensuring quality work.',
    icon: 'users',
    featured: false,
    order: 5,
    pricingTiers: [
      { name: 'Per Visit', flatRate: '$40' },
    ],
    features: [
      { feature: 'Contractor meet and greet' },
      { feature: 'Key and access management' },
      { feature: 'Work progress monitoring' },
      { feature: 'Quality verification' },
      { feature: 'Communication relay' },
      { feature: 'Final walk-through' },
      { feature: 'Payment coordination (optional)' },
      { feature: 'Project documentation' },
    ],
  },
  {
    name: 'Concierge Services',
    slug: 'concierge-services',
    shortDescription: 'Personalized services to make your lake stay exceptional.',
    icon: 'shopping-cart',
    featured: true,
    order: 6,
    pricingTiers: [
      { name: 'Hourly Rate', flatRate: '$50/hr', note: '1-hour minimum' },
      { name: 'Grocery Stocking', flatRate: '$50 + cost', note: 'Plus cost of goods' },
    ],
    features: [
      { feature: 'Grocery shopping and stocking' },
      { feature: 'Restaurant reservations' },
      { feature: 'Event ticket procurement' },
      { feature: 'Boat rental arrangements' },
      { feature: 'Golf tee times' },
      { feature: 'Spa appointments' },
      { feature: 'Transportation coordination' },
      { feature: 'Custom requests welcomed' },
    ],
  },
  {
    name: 'Winterization Services',
    slug: 'winterization-services',
    shortDescription: 'Comprehensive winterization to protect your property from freeze damage.',
    icon: 'snowflake',
    featured: false,
    order: 7,
    pricingTiers: [
      { name: 'Standard', flatRate: '$150 - $300', note: 'Based on home size' },
    ],
    features: [
      { feature: 'Water system drain-down' },
      { feature: 'Pipe insulation check' },
      { feature: 'Water heater preparation' },
      { feature: 'Toilet and appliance treatment' },
      { feature: 'Outdoor faucet protection' },
      { feature: 'Sprinkler system blow-out coordination' },
      { feature: 'HVAC maintenance scheduling' },
      { feature: 'Documentation of all services' },
    ],
  },
  {
    name: 'Summerization Services',
    slug: 'summerization-services',
    shortDescription: 'Get your property ready for the active season.',
    icon: 'sun',
    featured: false,
    order: 8,
    pricingTiers: [
      { name: 'Standard', flatRate: '$150 - $300', note: 'Based on home size' },
    ],
    features: [
      { feature: 'Water system restoration' },
      { feature: 'System pressure testing' },
      { feature: 'Appliance reconnection' },
      { feature: 'HVAC summer preparation' },
      { feature: 'Dock preparation' },
      { feature: 'Outdoor furniture setup' },
      { feature: 'Pool/hot tub coordination' },
      { feature: 'Complete system check' },
    ],
  },
  {
    name: 'Emergency Response',
    slug: 'emergency-response',
    shortDescription: '24/7 emergency response for unexpected situations.',
    icon: 'alert-triangle',
    featured: false,
    order: 9,
    pricingTiers: [
      { name: 'Emergency', note: 'Contact for rates' },
    ],
    features: [
      { feature: '24/7 availability' },
      { feature: 'Rapid response time' },
      { feature: 'Emergency repairs coordination' },
      { feature: 'Utility shut-off assistance' },
      { feature: 'Emergency contact notification' },
      { feature: 'Insurance company liaison' },
      { feature: 'Temporary security measures' },
      { feature: 'Follow-up inspections' },
    ],
  },
]

export const faqsData = [
  // General
  { question: 'What is home watch service?', answer: 'Home watch is a professional service that provides regular, thorough inspections of your property while you\'re away. We check all aspects of your home—HVAC, plumbing, security, and more—to catch potential issues before they become expensive problems.', category: 'general', order: 1 },
  { question: 'How is Lake Watch Pros different from a property manager?', answer: 'While property managers typically focus on rental properties and tenant management, we specialize in watching and maintaining homes that are primarily owner-occupied vacation properties. We\'re your eyes and ears at the lake when you can\'t be there.', category: 'general', order: 2 },
  { question: 'Are you insured and bonded?', answer: 'Yes, Lake Watch Pros is fully insured and bonded. We carry comprehensive liability insurance to protect your property and give you complete peace of mind.', category: 'general', order: 3 },
  { question: 'How do I get started with your services?', answer: 'Simply contact us to schedule a free consultation. We\'ll visit your property, discuss your needs, and create a customized service plan. There\'s no obligation—just honest advice from local experts.', category: 'general', order: 4 },

  // Home Watch
  { question: 'What does a home watch inspection include?', answer: 'Our comprehensive inspection covers interior and exterior visual checks, HVAC operation, plumbing for leaks, electrical systems, security system verification, appliance testing, pest inspection, and more. You\'ll receive a detailed report with photos after every visit.', category: 'home-watch', order: 1 },
  { question: 'How often should I have my home inspected?', answer: 'We recommend at least bi-weekly inspections for most properties. However, the ideal frequency depends on factors like your home\'s age, systems, and how long you\'re away. We can help determine the best schedule for your situation.', category: 'home-watch', order: 2 },
  { question: 'What happens if you find a problem during an inspection?', answer: 'We immediately notify you of any issues found. For urgent problems like water leaks or HVAC failures, we can coordinate emergency repairs with trusted local contractors. We\'ll document everything and keep you informed throughout the process.', category: 'home-watch', order: 3 },
  { question: 'Do you provide reports after each visit?', answer: 'Yes! After every inspection, you\'ll receive a detailed digital report with timestamps, photos, and notes on everything we checked. This documentation is also valuable for insurance purposes.', category: 'home-watch', order: 4 },

  // Concierge
  { question: 'What concierge services do you offer?', answer: 'Our concierge services include grocery shopping and stocking, restaurant reservations, event tickets, boat rental arrangements, golf tee times, spa appointments, transportation coordination, and custom requests. If it makes your lake visit better, we can probably help.', category: 'concierge', order: 1 },
  { question: 'How far in advance should I request concierge services?', answer: 'For best results, we recommend booking pre-arrival preparation and grocery stocking at least 48-72 hours in advance. For special reservations or event tickets, the more notice you can give, the better we can serve you.', category: 'concierge', order: 2 },
  { question: 'Can you stock specific brands or items I prefer?', answer: 'Absolutely! Just provide us with your shopping list and preferences, and we\'ll ensure everything is there when you arrive. We can shop at specific stores or source specialty items upon request.', category: 'concierge', order: 3 },

  // Pricing
  { question: 'How is home watch pricing determined?', answer: 'Our home watch pricing is based on your property\'s square footage and how frequently you want inspections. We offer per-visit rates and monthly subscription plans. The more frequent the visits, the lower the per-visit cost.', category: 'pricing', order: 1 },
  { question: 'Are there any hidden fees?', answer: 'No hidden fees, ever. Our pricing is transparent and straightforward. The only additional costs would be if you request extra services beyond your regular plan, and we\'ll always get your approval before any additional charges.', category: 'pricing', order: 2 },
  { question: 'Do you offer annual contracts?', answer: 'We offer both month-to-month and annual plans. Annual plans provide the best value and ensure consistent protection for your property year-round. However, we understand flexibility is important, so we never lock you into long-term commitments you\'re not comfortable with.', category: 'pricing', order: 3 },
  { question: 'Can I customize my service plan?', answer: 'Yes! Every property and owner is different. We\'ll work with you to create a customized plan that fits your specific needs and budget. Schedule a free consultation to discuss your options.', category: 'pricing', order: 4 },

  // Insurance
  { question: 'Does having home watch service affect my insurance?', answer: 'Many insurance companies look favorably on homes with professional home watch services. Regular inspections can help demonstrate due diligence in property maintenance. Some insurers may even offer premium discounts. Check with your insurance provider about potential benefits.', category: 'insurance', order: 1 },
  { question: 'Do you help with insurance claims if damage occurs?', answer: 'Yes, our detailed inspection reports and photo documentation can be invaluable for insurance claims. We can also coordinate with your insurance adjuster and provide any documentation they need.', category: 'insurance', order: 2 },
  { question: 'What liability coverage do you carry?', answer: 'We maintain comprehensive general liability insurance and are bonded for your protection. We\'re happy to provide proof of insurance upon request.', category: 'insurance', order: 3 },

  // Service Area
  { question: 'What areas do you serve?', answer: 'We serve properties throughout the Lake of the Ozarks region, including Lake Ozark, Osage Beach, Village of Four Seasons, Sunrise Beach, Camdenton, Laurie, and surrounding communities. If you\'re not sure if we cover your area, just ask!', category: 'service-area', order: 1 },
  { question: 'Do you charge extra for properties farther from your base?', answer: 'Our standard pricing applies to all properties within our primary service area. For properties in extended service areas, we may have a small travel fee, but we\'ll always discuss this upfront during your consultation.', category: 'service-area', order: 2 },
  { question: 'Can you service properties on the main channel and the arms?', answer: 'Yes, we service properties throughout the lake—main channel, Gravois Arm, Niangua Arm, and all the coves in between. Lake of the Ozarks is our home, and we know every part of it.', category: 'service-area', order: 3 },
]

export const testimonialsData = [
  { name: 'Sarah M.', location: 'Lake Ozark', quote: 'Lake Watch Pros gives us complete peace of mind. Knowing someone is checking on our property regularly while we\'re away is invaluable. They caught a small leak before it became a major problem!', rating: 5, featured: true },
  { name: 'Robert & Linda K.', location: 'Osage Beach', quote: 'The pre-arrival service is fantastic. We arrive to a perfectly prepared home every time—temperature set, lights on, groceries stocked. It feels like coming home to a five-star resort.', rating: 5, featured: true },
  { name: 'Mike T.', location: 'Four Seasons', quote: 'After a major storm, they were at our property within hours to check for damage and secure everything. Their quick response prevented thousands in additional damage.', rating: 5, featured: true },
  { name: 'Jennifer H.', location: 'Sunrise Beach', quote: 'The concierge services make our lake trips so much easier. Having groceries ready and restaurant reservations made ahead of time lets us start relaxing the moment we arrive.', rating: 5, featured: true },
  { name: 'David & Carol P.', location: 'Camdenton', quote: 'We\'ve used Lake Watch Pros for two years now. Their attention to detail and professionalism is unmatched. They treat our property like it\'s their own.', rating: 5, featured: true },
]

export const teamData = [
  { name: 'Jim Brentlinger', role: 'Co-Owner', shortBio: 'Lake of the Ozarks resident with deep roots in the community and a passion for exceptional service.', order: 1 },
  { name: 'Nate Bulock', role: 'Co-Owner', shortBio: 'Dedicated to building lasting relationships with property owners and ensuring their complete satisfaction.', order: 2 },
  { name: 'Michael Brandt', role: 'Co-Owner', shortBio: 'Committed to operational excellence and delivering premium service to every Lake Watch Pros client.', order: 3 },
]
