// Client-side local storage database mockup for GitHub Pages serverless demo

const SEED_DATA = {
  users: {
    "admin-coord": {
      name: "Admin Coordinator",
      email: "admin@volunteerhub.org",
      password: "admin123", // plain text check in mock
      role: "admin",
      phone: "+91 98765 43210",
      profileImage: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    "volunteer-rahul": {
      name: "Rahul Sharma",
      email: "rahul@volunteerhub.org",
      password: "password123",
      role: "volunteer",
      phone: "+91 99887 76655",
      profileImage: "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    "volunteer-priya": {
      name: "Priya Patel",
      email: "priya@volunteerhub.org",
      password: "password123",
      role: "volunteer",
      phone: "+91 91234 56789",
      profileImage: "https://api.dicebear.com/7.x/bottts/svg?seed=Priya",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    "volunteer-amit": {
      name: "Amit Verma",
      email: "amit@volunteerhub.org",
      password: "password123",
      role: "volunteer",
      phone: "+91 88776 65544",
      profileImage: "https://api.dicebear.com/7.x/bottts/svg?seed=Amit",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  volunteers: {
    "vol-rahul": {
      userId: "volunteer-rahul",
      age: 26,
      gender: "Male",
      address: "B-402 Shanti Apartments, Andheri, Mumbai",
      occupation: "Software Engineer",
      skills: "Coding, Web Design, First Aid, Documentation",
      interests: "Healthcare, Education, Technology",
      availability: "Weekends (Saturday & Sunday)",
      location: "Mumbai",
      hoursCompleted: 52.5,
      resumeUrl: "https://volunteerhub.org/docs/mock_resume.pdf",
      status: "approved"
    },
    "vol-priya": {
      userId: "volunteer-priya",
      age: 23,
      gender: "Female",
      address: "12-A Lotus Residency, CG Road, Ahmedabad",
      occupation: "Medical Student",
      skills: "Medical Assistance, First Aid, Event Management",
      interests: "Healthcare, Disaster Relief, Community Service",
      availability: "Flexible (Wednesdays & Saturdays)",
      location: "Ahmedabad",
      hoursCompleted: 15.0,
      resumeUrl: "https://volunteerhub.org/docs/mock_resume.pdf",
      status: "approved"
    },
    "vol-amit": {
      userId: "volunteer-amit",
      age: 21,
      gender: "Male",
      address: "Pocket C-5 Vasant Kunj, New Delhi",
      occupation: "College Student",
      skills: "Teaching, Mathematics, Public Speaking",
      interests: "Education, Child Welfare, Literacy",
      availability: "Weekdays (After 4 PM)",
      location: "New Delhi",
      hoursCompleted: 0.0,
      resumeUrl: "https://volunteerhub.org/docs/mock_resume.pdf",
      status: "pending"
    }
  },
  events: {
    "event-blood": {
      title: "Blood Donation Camp",
      description: "Annual Blood Donation drive in partnership with Red Cross Society. We need volunteers for crowd management, registration desk help, and refreshments distribution.",
      date: new Date('2026-07-10T09:00:00Z').toISOString(),
      time: "09:00 AM - 04:00 PM",
      location: "Community Center, Sector 15, Ahmedabad",
      capacity: 15,
      imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600",
      volunteerIds: ["vol-priya"]
    },
    "event-clean": {
      title: "Beach Cleanup Drive",
      description: "Cleaning up the coastal belt of Versova Beach. Trash bags and gloves will be provided. Join us to save marine life and restore the beach ecosystem.",
      date: new Date('2026-06-28T07:30:00Z').toISOString(),
      time: "07:30 AM - 11:30 AM",
      location: "Versova Beach, Mumbai",
      capacity: 50,
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
      volunteerIds: ["vol-rahul"]
    },
    "event-teach": {
      title: "Weekend Teaching for Kids",
      description: "Tutoring children from underprivileged communities in elementary Mathematics, Science, and English. Volunteers are expected to lead interactive teaching sessions.",
      date: new Date('2026-07-04T10:00:00Z').toISOString(),
      time: "10:00 AM - 01:00 PM",
      location: "Municipal School No. 3, Vasant Kunj, New Delhi",
      capacity: 8,
      imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
      volunteerIds: []
    }
  },
  tasks: {
    "task-1": {
      title: "Prepare Registration Spreadsheets",
      description: "Set up Google Sheets for blood donor check-in categories and coordinate data entry formats.",
      deadline: new Date('2026-07-08T17:00:00Z').toISOString(),
      status: "Pending",
      assignedVolunteerId: "vol-priya"
    },
    "task-2": {
      title: "Procure Trash Bags and Safety Gloves",
      description: "Coordinate with local vendors to purchase and deliver 100 compostable garbage bags and 50 pairs of thick latex cleanup gloves to Versova Beach.",
      deadline: new Date('2026-06-27T18:00:00Z').toISOString(),
      status: "In Progress",
      assignedVolunteerId: "vol-rahul"
    },
    "task-3": {
      title: "Draft Teaching Curriculum (Week 1)",
      description: "Prepare a 3-page guide containing basic number systems, addition games, and English alphabet reading lists for the kids event.",
      deadline: new Date('2026-07-02T12:00:00Z').toISOString(),
      status: "Completed",
      assignedVolunteerId: "vol-rahul"
    }
  },
  certificates: {
    "cert-rahul": {
      volunteerId: "vol-rahul",
      volunteerName: "Rahul Sharma",
      eventName: "Weekend Teaching for Kids (Pre-session)",
      hoursCompleted: 3.0,
      issuedAt: new Date('2026-05-15T12:00:00Z').toISOString(),
      verificationCode: "vh-cert-rahul-001"
    }
  },
  activityLogs: [
    {
      id: "log-1",
      userId: "volunteer-rahul",
      action: "Register",
      details: "Volunteer Rahul Sharma registered successfully",
      timestamp: new Date().toISOString()
    },
    {
      id: "log-2",
      userId: "admin-coord",
      action: "Approve Volunteer",
      details: "Admin Coordinator approved volunteer Rahul Sharma",
      timestamp: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: "noti-1",
      userId: "volunteer-rahul",
      message: "Welcome to VolunteerHub! Please wait for approval.",
      type: "general",
      read: false,
      createdAt: new Date().toISOString()
    }
  ]
};

// LocalStorage Helper functions
const getStore = () => {
  if (typeof window === 'undefined') return SEED_DATA;
  const data = localStorage.getItem('volunteerhub_db');
  if (!data) {
    localStorage.setItem('volunteerhub_db', JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  try {
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object' || !parsed.users || !parsed.volunteers || !parsed.events || !parsed.tasks || !parsed.certificates) {
      localStorage.setItem('volunteerhub_db', JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return parsed;
  } catch {
    localStorage.setItem('volunteerhub_db', JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
};

const saveStore = (store: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('volunteerhub_db', JSON.stringify(store));
  }
};

const addActivityLog = (store: any, userId: string, action: string, details: string) => {
  const log = {
    id: Math.random().toString(36).substring(7),
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  store.activityLogs = [log, ...store.activityLogs];
};

const addNotification = (store: any, userId: string, message: string, type = 'general') => {
  const noti = {
    id: Math.random().toString(36).substring(7),
    userId,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  store.notifications = [noti, ...store.notifications];
};

// Tokenizer & Jaccard for AI matching
const tokenize = (text: string): Set<string> => {
  if (!text) return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, '')
    .split(/[\s,]+/)
    .filter(w => w.length > 2);
  return new Set(words);
};

// Main Interceptor Handler
export const handleMockRequest = async (config: any): Promise<any> => {
  const store = getStore();
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

  // 1. Auth Endpoint: POST /api/auth/register
  if (url.includes('/auth/register') && method === 'post') {
    const { name, email, password, role = 'volunteer', phone = '', age, gender, address, occupation, skills, interests, availability, location, resumeUrl } = data;
    
    // Check duplication
    const emailExists = Object.values(store.users).some((u: any) => u.email === email);
    if (emailExists) {
      return { status: 400, data: { message: 'A user with this email already exists.' } };
    }

    const userId = Math.random().toString(36).substring(7);
    store.users[userId] = {
      name,
      email,
      password, // Dev-mock stores in plain text
      role,
      phone,
      profileImage: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let volunteerId = null;
    if (role === 'volunteer') {
      volunteerId = 'vol-' + Math.random().toString(36).substring(7);
      store.volunteers[volunteerId] = {
        userId,
        age: age ? parseInt(age) : null,
        gender: gender || 'Male',
        address: address || '',
        occupation: occupation || '',
        skills: skills || '',
        interests: interests || '',
        availability: availability || 'Flexible',
        location: location || '',
        hoursCompleted: 0.0,
        resumeUrl: resumeUrl || '',
        status: 'pending'
      };
    }

    addActivityLog(store, userId, 'Register', `User ${name} registered successfully`);
    saveStore(store);

    return {
      status: 201,
      data: {
        message: 'Registration successful! Your application is pending review.',
        userId,
        volunteerId
      }
    };
  }

  // 2. Auth Endpoint: POST /api/auth/login
  if (url.includes('/auth/login') && method === 'post') {
    const { email, password } = data;
    const userPair = Object.entries(store.users).find(([id, u]: any) => u.email === email);
    
    if (!userPair) {
      return { status: 401, data: { message: 'Invalid email or password.' } };
    }

    const [userId, user]: any = userPair;
    if (user.password !== password) {
      return { status: 401, data: { message: 'Invalid email or password.' } };
    }

    let volunteerId = undefined;
    if (user.role === 'volunteer') {
      const volPair = Object.entries(store.volunteers).find(([id, v]: any) => v.userId === userId);
      if (volPair) {
        volunteerId = volPair[0];
      }
    }

    addActivityLog(store, userId, 'Login', `User ${user.name} logged in successfully`);
    saveStore(store);

    return {
      status: 200,
      data: {
        token: `mock-jwt-token-for-${userId}`,
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          volunteerId
        }
      }
    };
  }

  // 3. Auth Endpoint: POST /api/auth/google
  if (url.includes('/auth/google') && method === 'post') {
    const { email, name, profileImage } = data;
    let userPair = Object.entries(store.users).find(([id, u]: any) => u.email === email);
    let userId: string;
    let volunteerId: string | undefined;

    if (!userPair) {
      userId = Math.random().toString(36).substring(7);
      store.users[userId] = {
        name,
        email,
        password: Math.random().toString(36),
        role: 'volunteer',
        phone: '',
        profileImage: profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      volunteerId = 'vol-' + Math.random().toString(36).substring(7);
      store.volunteers[volunteerId] = {
        userId,
        age: null,
        gender: 'Male',
        address: '',
        occupation: '',
        skills: '',
        interests: '',
        availability: 'Flexible',
        location: '',
        hoursCompleted: 0.0,
        resumeUrl: '',
        status: 'pending'
      };

      addActivityLog(store, userId, 'Google Register', `Volunteer ${name} registered via Google`);
    } else {
      userId = userPair[0];
      const volPair = Object.entries(store.volunteers).find(([id, v]: any) => v.userId === userId);
      if (volPair) {
        volunteerId = volPair[0];
      }
      addActivityLog(store, userId, 'Google Login', `User ${name} logged in via Google`);
    }

    saveStore(store);

    return {
      status: 200,
      data: {
        token: `mock-jwt-token-for-${userId}`,
        user: {
          id: userId,
          name,
          email,
          role: store.users[userId].role,
          profileImage: store.users[userId].profileImage,
          volunteerId
        }
      }
    };
  }

  // 4. GET /api/volunteers
  if (url.endsWith('/volunteers') && method === 'get') {
    const search = config.params?.search?.toLowerCase() || '';
    const status = config.params?.status?.toLowerCase() || '';
    const skills = config.params?.skills?.toLowerCase() || '';
    const location = config.params?.location?.toLowerCase() || '';

    let list = Object.entries(store.volunteers).map(([id, vol]: any) => {
      return {
        id,
        ...vol,
        user: { id: vol.userId, ...store.users[vol.userId] }
      };
    });

    if (search) {
      list = list.filter((v: any) => v.user.name.toLowerCase().includes(search) || v.user.email.toLowerCase().includes(search));
    }
    if (status) {
      list = list.filter((v: any) => v.status === status);
    }
    if (skills) {
      list = list.filter((v: any) => v.skills.toLowerCase().includes(skills));
    }
    if (location) {
      list = list.filter((v: any) => v.location.toLowerCase().includes(location));
    }

    return { status: 200, data: list };
  }

  // 5. GET /api/volunteers/leaderboard
  if (url.includes('/volunteers/leaderboard') && method === 'get') {
    const leaderboard = Object.entries(store.volunteers)
      .filter(([id, v]: any) => v.status === 'approved')
      .map(([id, vol]: any) => {
        const user = store.users[vol.userId] || {};
        return {
          id,
          name: user.name || 'Unknown',
          profileImage: user.profileImage || '',
          hoursCompleted: vol.hoursCompleted || 0,
          skills: vol.skills || '',
          location: vol.location || ''
        };
      })
      .sort((a, b) => b.hoursCompleted - a.hoursCompleted);

    return { status: 200, data: leaderboard };
  }

  // 6. GET /api/volunteer/:id
  if (url.includes('/volunteer/') && !url.includes('/matching/') && method === 'get') {
    const id = url.split('/volunteer/')[1].split('?')[0];
    const vol = store.volunteers[id];
    if (!vol) {
      return { status: 404, data: { message: 'Volunteer profile not found' } };
    }

    const user = store.users[vol.userId];
    const tasks = Object.entries(store.tasks)
      .filter(([tId, t]: any) => t.assignedVolunteerId === id)
      .map(([tId, t]: any) => ({ id: tId, ...t }));

    const events = Object.entries(store.events)
      .filter(([eId, e]: any) => e.volunteerIds && e.volunteerIds.includes(id))
      .map(([eId, e]: any) => ({ id: eId, ...e }));

    const certificates = Object.entries(store.certificates)
      .filter(([cId, c]: any) => c.volunteerId === id)
      .map(([cId, c]: any) => ({ id: cId, ...c }));

    return {
      status: 200,
      data: {
        id,
        ...vol,
        user: { id: vol.userId, ...user },
        tasks,
        events,
        certificates
      }
    };
  }

  // 7. PUT /api/volunteer/:id
  if (url.includes('/volunteer/') && method === 'put') {
    const id = url.split('/volunteer/')[1].split('?')[0];
    const vol = store.volunteers[id];
    if (!vol) return { status: 404, data: { message: 'Volunteer not found' } };

    const { name, phone, age, gender, address, occupation, skills, interests, availability, location, hoursCompleted, status } = data;

    // User updates
    const userRef = store.users[vol.userId];
    if (userRef) {
      if (name !== undefined) userRef.name = name;
      if (phone !== undefined) userRef.phone = phone;
    }

    // Vol updates
    if (age !== undefined) vol.age = age ? parseInt(age) : null;
    if (gender !== undefined) vol.gender = gender;
    if (address !== undefined) vol.address = address;
    if (occupation !== undefined) vol.occupation = occupation;
    if (skills !== undefined) vol.skills = skills;
    if (interests !== undefined) vol.interests = interests;
    if (availability !== undefined) vol.availability = availability;
    if (location !== undefined) vol.location = location;
    if (hoursCompleted !== undefined) vol.hoursCompleted = parseFloat(hoursCompleted);

    const oldStatus = vol.status;
    if (status !== undefined && status !== oldStatus) {
      vol.status = status;
      addNotification(store, vol.userId, `Your volunteer profile status was updated to ${status}.`, 'profile_status');
    }

    addActivityLog(store, vol.userId, 'Update Volunteer Profile', `Updated profile: ${name || userRef.name}`);
    saveStore(store);

    return { status: 200, data: { message: 'Volunteer updated successfully' } };
  }

  // 8. DELETE /api/volunteer/:id
  if (url.includes('/volunteer/') && method === 'delete') {
    const id = url.split('/volunteer/')[1].split('?')[0];
    const vol = store.volunteers[id];
    if (!vol) return { status: 404, data: { message: 'Volunteer not found' } };

    delete store.users[vol.userId];
    delete store.volunteers[id];

    // Clean up tasks/certificates
    Object.keys(store.tasks).forEach((tId) => {
      if (store.tasks[tId].assignedVolunteerId === id) delete store.tasks[tId];
    });
    Object.keys(store.certificates).forEach((cId) => {
      if (store.certificates[cId].volunteerId === id) delete store.certificates[cId];
    });
    Object.keys(store.events).forEach((eId) => {
      if (store.events[eId].volunteerIds) {
        store.events[eId].volunteerIds = store.events[eId].volunteerIds.filter((vId: string) => vId !== id);
      }
    });

    saveStore(store);
    return { status: 200, data: { message: 'Volunteer deleted successfully' } };
  }

  // 9. GET /api/volunteers/matching/:eventId
  if (url.includes('/volunteers/matching/') && method === 'get') {
    const eventId = url.split('/volunteers/matching/')[1].split('?')[0];
    const event = store.events[eventId];
    if (!event) return { status: 404, data: { message: 'Event not found' } };

    const eventKeywords = tokenize(`${event.title} ${event.description}`);

    const matchingList = Object.entries(store.volunteers)
      .filter(([id, vol]: any) => vol.status === 'approved')
      .map(([id, vol]: any) => {
        const user = store.users[vol.userId] || {};
        const volKeywords = tokenize(`${vol.skills} ${vol.interests}`);

        let matchScore = 0;
        if (eventKeywords.size > 0 || volKeywords.size > 0) {
          const intersection = new Set([...eventKeywords].filter(x => volKeywords.has(x)));
          const union = new Set([...eventKeywords, ...volKeywords]);
          matchScore = Math.round((intersection.size / union.size) * 100);
        }

        return {
          id,
          name: user.name || 'Unknown',
          email: user.email || '',
          profileImage: user.profileImage || '',
          skills: vol.skills || '',
          location: vol.location || '',
          matchScore
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return { status: 200, data: matchingList };
  }

  // 10. GET /api/events
  if (url.endsWith('/events') && method === 'get') {
    const eventsList = Object.entries(store.events).map(([id, ev]: any) => {
      const vols = (ev.volunteerIds || []).map((vId: string) => {
        const vol = store.volunteers[vId];
        const user = vol ? store.users[vol.userId] : null;
        return vol ? { id: vId, user } : null;
      }).filter(Boolean);

      return { id, ...ev, volunteers: vols };
    });

    return { status: 200, data: eventsList };
  }

  // 11. POST /api/events
  if (url.endsWith('/events') && method === 'post') {
    const { title, description, date, time, location, capacity, imageUrl } = data;
    const eventId = 'event-' + Math.random().toString(36).substring(7);
    store.events[eventId] = {
      title,
      description,
      date: new Date(date).toISOString(),
      time,
      location,
      capacity: parseInt(capacity),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600",
      volunteerIds: []
    };

    addActivityLog(store, "SYSTEM", 'Create Event', `Created event: ${title}`);
    saveStore(store);

    return { status: 201, data: { id: eventId, ...store.events[eventId] } };
  }

  // 12. DELETE /api/events/:id
  if (url.includes('/events/') && method === 'delete') {
    const id = url.split('/events/')[1].split('?')[0];
    delete store.events[id];
    saveStore(store);
    return { status: 200, data: { message: 'Event deleted successfully' } };
  }

  // 13. POST /api/events/:id/register
  if (url.includes('/events/') && url.includes('/register') && method === 'post') {
    const id = url.split('/events/')[1].split('/register')[0];
    const event = store.events[id];
    if (!event) return { status: 404, data: { message: 'Event not found' } };

    // Get current log user ID from token mock
    const tokenStr = config.headers?.Authorization || config.headers?.authorization || '';
    const userId = tokenStr.split('mock-jwt-token-for-')[1] || 'volunteer-rahul';
    const volPair = Object.entries(store.volunteers).find(([vId, v]: any) => v.userId === userId);
    
    if (!volPair) {
      return { status: 400, data: { message: 'Only registered volunteers can register.' } };
    }

    const [volId, vol]: any = volPair;
    if (vol.status !== 'approved') {
      return { status: 403, data: { message: 'Volunteer profile must be approved by coordinator to register for events.' } };
    }

    const currentVols = event.volunteerIds || [];
    if (currentVols.includes(volId)) {
      return { status: 400, data: { message: 'You are already registered.' } };
    }
    if (currentVols.length >= event.capacity) {
      return { status: 400, data: { message: 'Event has reached capacity.' } };
    }

    event.volunteerIds = [...currentVols, volId];
    addActivityLog(store, userId, 'Event Registration', `Registered for ${event.title}`);
    addNotification(store, userId, `Successfully registered for event: ${event.title}`, 'event_registration');
    saveStore(store);

    return { status: 200, data: { message: 'Successfully registered for event.' } };
  }

  // 14. POST /api/events/:id/cancel
  if (url.includes('/events/') && url.includes('/cancel') && method === 'post') {
    const id = url.split('/events/')[1].split('/cancel')[0];
    const event = store.events[id];
    if (!event) return { status: 404, data: { message: 'Event not found' } };

    const tokenStr = config.headers?.Authorization || config.headers?.authorization || '';
    const userId = tokenStr.split('mock-jwt-token-for-')[1] || 'volunteer-rahul';
    const volPair = Object.entries(store.volunteers).find(([vId, v]: any) => v.userId === userId);
    
    if (!volPair) return { status: 400, data: { message: 'Registration not found' } };

    const [volId, vol]: any = volPair;
    event.volunteerIds = (event.volunteerIds || []).filter((vId: string) => vId !== volId);
    
    addActivityLog(store, userId, 'Event Registration Cancellation', `Cancelled registration for ${event.title}`);
    saveStore(store);

    return { status: 200, data: { message: 'Registration cancelled successfully.' } };
  }

  // 15. POST /api/events/:id/checkin
  if (url.includes('/events/') && url.includes('/checkin') && method === 'post') {
    const id = url.split('/events/')[1].split('/checkin')[0];
    const { volunteerId } = data;
    const event = store.events[id];
    
    if (!event) return { status: 404, data: { message: 'Event not found' } };
    const volunteer = store.volunteers[volunteerId];
    if (!volunteer) return { status: 404, data: { message: 'Volunteer not found' } };

    const user = store.users[volunteer.userId];

    // Check duplication
    const duplicate = Object.values(store.certificates).some((c: any) => c.volunteerId === volunteerId && c.eventName === event.title);
    if (duplicate) {
      return { status: 400, data: { message: 'Volunteer already checked-in.' } };
    }

    const certId = 'cert-' + Math.random().toString(36).substring(7);
    store.certificates[certId] = {
      volunteerId,
      volunteerName: user.name,
      eventName: event.title,
      hoursCompleted: 3.0,
      issuedAt: new Date().toISOString(),
      verificationCode: 'vh-cert-' + Math.random().toString(36).substring(5)
    };

    volunteer.hoursCompleted = (volunteer.hoursCompleted || 0) + 3.0;
    addNotification(store, volunteer.userId, `Attendance verified for: ${event.title}. Certificate issued!`, 'attendance_verify');
    addActivityLog(store, "SYSTEM", 'Verify Attendance', `Checked-in ${user.name} for ${event.title}`);
    saveStore(store);

    return { status: 200, data: { message: 'Attendance verified successfully. Certificate issued!' } };
  }

  // 16. GET /api/tasks
  if (url.endsWith('/tasks') && method === 'get') {
    const tokenStr = config.headers?.Authorization || config.headers?.authorization || '';
    const userId = tokenStr.split('mock-jwt-token-for-')[1] || 'admin-coord';
    const user = store.users[userId] || {};

    let list = Object.entries(store.tasks).map(([id, t]: any) => {
      const vol = store.volunteers[t.assignedVolunteerId];
      const u = vol ? store.users[vol.userId] : null;
      return {
        id,
        ...t,
        assignedVolunteer: vol ? { id: t.assignedVolunteerId, user: u } : null
      };
    });

    if (user.role === 'volunteer') {
      const volPair = Object.entries(store.volunteers).find(([vId, v]: any) => v.userId === userId);
      if (volPair) {
        list = list.filter((t: any) => t.assignedVolunteerId === volPair[0]);
      } else {
        list = [];
      }
    }

    return { status: 200, data: list };
  }

  // 17. POST /api/tasks
  if (url.endsWith('/tasks') && method === 'post') {
    const { title, description, deadline, assignedVolunteerId } = data;
    const taskId = 'task-' + Math.random().toString(36).substring(7);
    store.tasks[taskId] = {
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      status: "Pending",
      assignedVolunteerId
    };

    const vol = store.volunteers[assignedVolunteerId];
    if (vol) {
      addNotification(store, vol.userId, `New task assigned: ${title}`, 'task_assigned');
    }

    addActivityLog(store, "SYSTEM", 'Create Task', `Created task: ${title}`);
    saveStore(store);

    return { status: 201, data: { id: taskId, ...store.tasks[taskId] } };
  }

  // 18. PUT /api/tasks/:id
  if (url.includes('/tasks/') && method === 'put') {
    const id = url.split('/tasks/')[1].split('?')[0];
    const task = store.tasks[id];
    if (!task) return { status: 404, data: { message: 'Task not found' } };

    const { status, title, description, deadline, assignedVolunteerId } = data;
    
    // Check complete authorization
    const tokenStr = config.headers?.Authorization || config.headers?.authorization || '';
    const userId = tokenStr.split('mock-jwt-token-for-')[1] || 'volunteer-rahul';
    const userRole = store.users[userId]?.role || 'volunteer';

    if (status === 'Completed' && userRole !== 'admin') {
      return { status: 403, data: { message: 'Unauthorized. Only coordinators can complete tasks.' } };
    }

    if (status !== undefined) task.status = status;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (deadline !== undefined) task.deadline = new Date(deadline).toISOString();
    if (assignedVolunteerId !== undefined) task.assignedVolunteerId = assignedVolunteerId;

    if (status === 'Completed') {
      const vol = store.volunteers[task.assignedVolunteerId];
      if (vol) {
        vol.hoursCompleted = (vol.hoursCompleted || 0) + 2.0;
        addNotification(store, vol.userId, `Task "${task.title}" marked Completed. +2.0 hours credited!`, 'task_completed');
      }
    }

    addActivityLog(store, userId, 'Update Task', `Updated task status of "${task.title}" to ${status}`);
    saveStore(store);

    return { status: 200, data: { message: 'Task updated successfully' } };
  }

  // 19. DELETE /api/tasks/:id
  if (url.includes('/tasks/') && method === 'delete') {
    const id = url.split('/tasks/')[1].split('?')[0];
    delete store.tasks[id];
    saveStore(store);
    return { status: 200, data: { message: 'Task deleted successfully' } };
  }

  // 20. GET /api/activity-logs
  if (url.endsWith('/activity-logs') && method === 'get') {
    return { status: 200, data: store.activityLogs };
  }

  // 21. GET /api/notifications
  if (url.endsWith('/notifications') && method === 'get') {
    const tokenStr = config.headers?.Authorization || config.headers?.authorization || '';
    const userId = tokenStr.split('mock-jwt-token-for-')[1] || 'volunteer-rahul';
    const list = store.notifications.filter((n: any) => n.userId === userId);
    return { status: 200, data: list };
  }

  // 22. PUT /api/notifications/:id/read
  if (url.includes('/notifications/') && url.endsWith('/read') && method === 'put') {
    const id = url.split('/notifications/')[1].split('/read')[0];
    const noti = store.notifications.find((n: any) => n.id === id);
    if (noti) noti.read = true;
    saveStore(store);
    return { status: 200, data: { success: true } };
  }

  // 23. Mock Document Downloads (PDF, Excel, Certificates)
  if (url.includes('/reports/') && method === 'get') {
    // Generate dummy text blob representing the documents
    const content = `VolunteerHub Mock File Stream\nDocument: ${url}\nGenerated: ${new Date().toLocaleString()}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    return {
      status: 200,
      data: blob,
      headers: { 'content-type': 'application/octet-stream' }
    };
  }

  return { status: 404, data: { message: 'Endpoint mock not found' } };
};
