const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Project = require('./models/Project');
const Review = require('./models/Review');
const Proposal = require('./models/Proposal');
const Portfolio = require('./models/Portfolio');
const Chat = require('./models/Chat');
const ChatMessage = require('./models/ChatMessage');
const Testimonial = require('./models/Testimonial');

const specialists = [
  { name: 'Chioma Okafor', email: 'chioma@example.com', location: 'Aba, Abia State', bio: 'Brand identity specialist with 5+ years of experience helping SMEs build memorable brands.', categories: ['Logo Design', 'Brand Identity'] },
  { name: 'Emeka Nwosu', email: 'emeka@example.com', location: 'Enugu, Enugu State', bio: 'UI/UX designer focused on creating intuitive digital experiences for African businesses.', categories: ['UI/UX Design', 'Web Design', 'Mobile App Design'] },
  { name: 'Funke Adebayo', email: 'funke@example.com', location: 'Lagos, Nigeria', bio: 'Creative director specializing in packaging design and print materials for FMCG brands.', categories: ['Packaging Design', 'Print Design', 'Graphic Design'] },
  { name: 'Tunde Balogun', email: 'tunde@example.com', location: 'Ibadan, Oyo State', bio: 'Motion graphics designer and illustrator bringing brands to life through animation.', categories: ['Motion Graphics', 'Illustration', 'Typography'] },
  { name: 'Ngozi Eze', email: 'ngozi@example.com', location: 'Port Harcourt, Rivers State', bio: 'Social media design expert helping businesses stand out on digital platforms.', categories: ['Social Media Design', 'Graphic Design', 'Brand Identity'] },
  { name: 'Segun Adeleke', email: 'segun@example.com', location: 'Abuja, Nigeria', bio: 'Full-stack designer handling everything from logo to web development.', categories: ['Logo Design', 'Web Design', 'Brand Identity'] }
];

const smeUsers = [
  { name: 'Amara Obi', email: 'amara@example.com' },
  { name: 'Chidi Ani', email: 'chidi@example.com' },
  { name: 'Yetunde Lawal', email: 'yetunde@example.com' }
];

const projectTemplates = [
  { title: 'Modern Logo for Fashion Boutique', description: 'We need a modern, elegant logo for our fashion boutique in Aba. We specialize in African-inspired contemporary wear and want our brand identity to reflect both tradition and modernity.', industry: 'Fashion & Clothing', budget: 150000 },
  { title: 'Restaurant Brand Identity Package', description: 'Looking for a complete brand identity for our new restaurant in Enugu. Need logo, menu design, color palette, and brand guidelines.', industry: 'Food & Restaurant', budget: 250000 },
  { title: 'E-commerce Website Design', description: 'Need a clean, mobile-responsive e-commerce website design for our tech accessories store. Must include product pages, cart, and checkout flow.', industry: 'Technology', budget: 350000 },
  { title: 'Packaging Design for Skincare Line', description: 'We are launching a new organic skincare line and need premium packaging designs for 5 products. Must be eco-friendly themed.', industry: 'Manufacturing', budget: 200000 },
  { title: 'Social Media Graphics Package', description: 'Need 30 social media templates for Instagram and Facebook. Must be cohesive with our brand colors and include story templates too.', industry: 'Creative & Media', budget: 80000 },
  { title: 'Complete Brand Guide for Retail Shop', description: 'We are rebranding our retail chain and need a comprehensive brand guide including logo usage, colors, typography, and application examples.', industry: 'Retail & Shops', budget: 180000 }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const createdSpecialists = [];
    for (const s of specialists) {
      const existing = await User.findOne({ email: s.email });
      if (existing) {
        createdSpecialists.push(existing);
        continue;
      }
      const user = await User.create({
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: 'specialist',
        location: s.location,
        bio: s.bio,
        isVerified: true,
        kyc: { status: 'approved', idType: 'national_id', idNumber: `ID${Date.now()}` }
      });
      createdSpecialists.push(user);
      console.log(`Created specialist: ${s.name}`);

      for (const cat of s.categories) {
        await Portfolio.create({
          specialist: user._id,
          title: `${cat} Project - ${s.name}`,
          description: `Sample ${cat.toLowerCase()} project showcasing my work.`,
          category: cat,
          imageUrl: ''
        });
      }
    }

    const createdSMEs = [];
    for (const s of smeUsers) {
      const existing = await User.findOne({ email: s.email });
      if (existing) {
        createdSMEs.push(existing);
        continue;
      }
      const user = await User.create({
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: 'sme',
        isVerified: true
      });
      createdSMEs.push(user);
      console.log(`Created SME: ${s.name}`);
    }

    const createdProjects = [];
    for (let i = 0; i < projectTemplates.length; i++) {
      const pt = projectTemplates[i];
      const owner = createdSMEs[i % createdSMEs.length];

      if (i < 3) {
        const p = await Project.create({
          title: pt.title,
          description: pt.description,
          industry: pt.industry,
          budget: pt.budget,
          owner: owner._id,
          status: 'open'
        });
        createdProjects.push(p);

        for (const spec of createdSpecialists.slice(0, 2)) {
          await Proposal.create({
            specialist: spec._id,
            project: p._id,
            coverLetter: `Hi! I would love to work on this project. I have extensive experience in ${pt.industry.toLowerCase()} branding and can deliver high-quality work within the timeline.`,
            bidAmount: Math.round(pt.budget * (0.7 + Math.random() * 0.3)),
            timeline: Math.floor(10 + Math.random() * 15),
            status: 'pending'
          });
        }
      } else if (i < 5) {
        const spec = createdSpecialists[i - 3];
        const p = await Project.create({
          title: pt.title,
          description: pt.description,
          industry: pt.industry,
          budget: pt.budget,
          owner: owner._id,
          status: 'active',
          assignedSpecialist: spec._id,
          assignedAt: new Date(),
          acceptanceStatus: 'accepted',
          acceptedAt: new Date()
        });
        createdProjects.push(p);

        const chat = await Chat.create({ participants: [owner._id, spec._id] });
        await ChatMessage.create({
          chat: chat._id,
          sender: spec._id,
          text: `Hi! I have been assigned to work on "${pt.title}". I am excited to get started!`
        });
      } else {
        const spec = createdSpecialists[createdSpecialists.length - 1];
        const p = await Project.create({
          title: pt.title,
          description: pt.description,
          industry: pt.industry,
          budget: pt.budget,
          owner: owner._id,
          status: 'completed',
          assignedSpecialist: spec._id,
          assignedAt: new Date(Date.now() - 30 * 86400000),
          acceptanceStatus: 'accepted',
          acceptedAt: new Date(Date.now() - 30 * 86400000),
          completedAt: new Date(Date.now() - 7 * 86400000)
        });
        createdProjects.push(p);

        await Review.create({
          reviewer: owner._id,
          specialist: spec._id,
          project: p._id,
          rating: 4 + Math.round(Math.random()),
          comment: `Great work on the ${pt.industry.toLowerCase()} project. The designer was professional and delivered on time.`
        });

        const chat = await Chat.create({ participants: [owner._id, spec._id] });
        await ChatMessage.create({
          chat: chat._id,
          sender: spec._id,
          text: `Project "${pt.title}" is complete! Let me know if you need any revisions.`
        });
      }
    }

    const testimonialCount = await Testimonial.countDocuments();
    if (testimonialCount === 0) {
      const testimonialData = [
        { name: 'Amara Obi', text: 'Branda made it so easy to find a professional designer for my boutique. The logo exceeded my expectations!', role: 'Business Owner', company: 'Amara Fashion House' },
        { name: 'Chioma Okafor', text: 'As a designer, Branda has connected me with amazing clients who appreciate quality work.', role: 'Brand Identity Specialist', company: 'Chioma Designs' },
        { name: 'Tunde Balogun', text: 'The platform is intuitive and the project management tools make collaboration seamless.', role: 'Motion Graphics Designer', company: 'Tunde Animates' }
      ];
      for (const t of testimonialData) {
        await Testimonial.create(t);
      }
      console.log('Testimonials created');
    }

    console.log('Seed complete!');
    console.log('Specialist logins: chioma@example.com / password123');
    console.log('SME logins: amara@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
