import { db } from './utils/firebase';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding VolunteerHub Firestore Database...');

  // Reset collections (Since it is mock, we can write empty structures or delete docs)
  // Let's set initial documents
  const adminPassword = await bcrypt.hash('admin123', 10);
  const volunteerPassword = await bcrypt.hash('password123', 10);

  // 1. Seed admin
  const adminId = 'admin-coord';
  await db.collection('users').doc(adminId).set({
    name: 'Admin Coordinator',
    email: 'admin@volunteerhub.org',
    password: adminPassword,
    role: 'admin',
    phone: '+91 98765 43210',
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 2. Seed Approved Volunteer: Rahul
  const rId = 'volunteer-rahul';
  await db.collection('users').doc(rId).set({
    name: 'Rahul Sharma',
    email: 'rahul@volunteerhub.org',
    password: volunteerPassword,
    role: 'volunteer',
    phone: '+91 99887 76655',
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const rahulVolId = 'vol-rahul';
  await db.collection('volunteers').doc(rahulVolId).set({
    userId: rId,
    age: 26,
    gender: 'Male',
    address: 'B-402 Shanti Apartments, Andheri, Mumbai',
    occupation: 'Software Engineer',
    skills: 'Coding, Web Design, First Aid, Documentation',
    interests: 'Healthcare, Education, Technology',
    availability: 'Weekends (Saturday & Sunday)',
    location: 'Mumbai',
    hoursCompleted: 52.5,
    resumeUrl: 'https://volunteerhub.org/docs/mock_resume.pdf',
    status: 'approved'
  });

  // 3. Seed Approved Volunteer: Priya
  const pId = 'volunteer-priya';
  await db.collection('users').doc(pId).set({
    name: 'Priya Patel',
    email: 'priya@volunteerhub.org',
    password: volunteerPassword,
    role: 'volunteer',
    phone: '+91 91234 56789',
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const priyaVolId = 'vol-priya';
  await db.collection('volunteers').doc(priyaVolId).set({
    userId: pId,
    age: 23,
    gender: 'Female',
    address: '12-A Lotus Residency, CG Road, Ahmedabad',
    occupation: 'Medical Student',
    skills: 'Medical Assistance, First Aid, Event Management',
    interests: 'Healthcare, Disaster Relief, Community Service',
    availability: 'Flexible (Wednesdays & Saturdays)',
    location: 'Ahmedabad',
    hoursCompleted: 15.0,
    resumeUrl: 'https://volunteerhub.org/docs/mock_resume.pdf',
    status: 'approved'
  });

  // 4. Seed Pending Volunteer: Amit
  const aId = 'volunteer-amit';
  await db.collection('users').doc(aId).set({
    name: 'Amit Verma',
    email: 'amit@volunteerhub.org',
    password: volunteerPassword,
    role: 'volunteer',
    phone: '+91 88776 65544',
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const amitVolId = 'vol-amit';
  await db.collection('volunteers').doc(amitVolId).set({
    userId: aId,
    age: 21,
    gender: 'Male',
    address: 'Pocket C-5 Vasant Kunj, New Delhi',
    occupation: 'College Student',
    skills: 'Teaching, Mathematics, Public Speaking',
    interests: 'Education, Child Welfare, Literacy',
    availability: 'Weekdays (After 4 PM)',
    location: 'New Delhi',
    hoursCompleted: 0.0,
    resumeUrl: 'https://volunteerhub.org/docs/mock_resume.pdf',
    status: 'pending'
  });

  // 5. Seed Events
  const ev1Id = 'event-blood';
  await db.collection('events').doc(ev1Id).set({
    title: 'Blood Donation Camp',
    description: 'Annual Blood Donation drive in partnership with Red Cross Society. We need volunteers for crowd management, registration desk help, and refreshments distribution.',
    date: new Date('2026-07-10T09:00:00Z').toISOString(),
    time: '09:00 AM - 04:00 PM',
    location: 'Community Center, Sector 15, Ahmedabad',
    capacity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    volunteerIds: [priyaVolId] // Priya is registered
  });

  const ev2Id = 'event-clean';
  await db.collection('events').doc(ev2Id).set({
    title: 'Beach Cleanup Drive',
    description: 'Cleaning up the coastal belt of Versova Beach. Trash bags and gloves will be provided. Join us to save marine life and restore the beach ecosystem.',
    date: new Date('2026-06-28T07:30:00Z').toISOString(),
    time: '07:30 AM - 11:30 AM',
    location: 'Versova Beach, Mumbai',
    capacity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    volunteerIds: [rahulVolId] // Rahul is registered
  });

  const ev3Id = 'event-teach';
  await db.collection('events').doc(ev3Id).set({
    title: 'Weekend Teaching for Kids',
    description: 'Tutoring children from underprivileged communities in elementary Mathematics, Science, and English. Volunteers are expected to lead interactive teaching sessions.',
    date: new Date('2026-07-04T10:00:00Z').toISOString(),
    time: '10:00 AM - 01:00 PM',
    location: 'Municipal School No. 3, Vasant Kunj, New Delhi',
    capacity: 8,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
    volunteerIds: []
  });

  // 6. Seed Tasks
  await db.collection('tasks').doc('task-1').set({
    title: 'Prepare Registration Spreadsheets',
    description: 'Set up Google Sheets for blood donor check-in categories and coordinate data entry formats.',
    deadline: new Date('2026-07-08T17:00:00Z').toISOString(),
    status: 'Pending',
    assignedVolunteerId: priyaVolId
  });

  await db.collection('tasks').doc('task-2').set({
    title: 'Procure Trash Bags and Safety Gloves',
    description: 'Coordinate with local vendors to purchase and deliver 100 compostable garbage bags and 50 pairs of thick latex cleanup gloves to Versova Beach.',
    deadline: new Date('2026-06-27T18:00:00Z').toISOString(),
    status: 'In Progress',
    assignedVolunteerId: rahulVolId
  });

  await db.collection('tasks').doc('task-3').set({
    title: 'Draft Teaching Curriculum (Week 1)',
    description: 'Prepare a 3-page guide containing basic number systems, addition games, and English alphabet reading lists for the kids event.',
    deadline: new Date('2026-07-02T12:00:00Z').toISOString(),
    status: 'Completed',
    assignedVolunteerId: rahulVolId
  });

  // 7. Seed Certificates
  await db.collection('certificates').doc('cert-rahul').set({
    volunteerId: rahulVolId,
    volunteerName: 'Rahul Sharma',
    eventName: 'Weekend Teaching for Kids (Pre-session)',
    hoursCompleted: 3.0,
    issuedAt: new Date('2026-05-15T12:00:00Z').toISOString(),
    verificationCode: 'vh-cert-rahul-001'
  });

  // 8. Seed Activity logs
  await db.collection('activityLogs').doc('log-1').set({
    userId: rId,
    action: 'Register',
    details: 'Volunteer Rahul Sharma registered successfully',
    timestamp: new Date().toISOString()
  });

  await db.collection('activityLogs').doc('log-2').set({
    userId: adminId,
    action: 'Approve Volunteer',
    details: 'Admin Coordinator approved volunteer Rahul Sharma',
    timestamp: new Date().toISOString()
  });

  console.log('Firebase Seeding completed successfully.');
}

seed().catch(err => console.error('Seeding error:', err));
