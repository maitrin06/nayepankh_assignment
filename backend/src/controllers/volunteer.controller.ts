import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../utils/firebase';
import { sendApprovalEmail } from '../utils/nodemailer';
import { logActivity } from '../utils/activity';
import { sendRealTimeNotification } from '../utils/socket';

// GET all volunteers (Admin only, with filters)
export const getVolunteers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, skills, availability, status, location, minHours } = req.query;

    const volunteersSnapshot = await db.collection('volunteers').get();
    const usersSnapshot = await db.collection('users').get();

    // Map users for fast lookup
    const usersMap = new Map<string, any>();
    usersSnapshot.docs.forEach((doc: any) => {
      usersMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    let volunteersList = volunteersSnapshot.docs.map((doc: any) => {
      const volData = doc.data();
      const user = usersMap.get(volData.userId) || null;
      return {
        id: doc.id,
        ...volData,
        user
      };
    });

    // Apply filtering
    if (search) {
      const searchStr = String(search).toLowerCase();
      volunteersList = volunteersList.filter((v: any) => {
        if (!v.user) return false;
        return (
          v.user.name.toLowerCase().includes(searchStr) ||
          v.user.email.toLowerCase().includes(searchStr)
        );
      });
    }

    if (skills) {
      const skillStr = String(skills).toLowerCase();
      volunteersList = volunteersList.filter((v: any) => 
        v.skills && v.skills.toLowerCase().includes(skillStr)
      );
    }

    if (availability) {
      const availStr = String(availability).toLowerCase();
      volunteersList = volunteersList.filter((v: any) => 
        v.availability && v.availability.toLowerCase().includes(availStr)
      );
    }

    if (status) {
      const statusStr = String(status).toLowerCase();
      volunteersList = volunteersList.filter((v: any) => 
        v.status && v.status.toLowerCase() === statusStr
      );
    }

    if (location) {
      const locStr = String(location).toLowerCase();
      volunteersList = volunteersList.filter((v: any) => 
        v.location && v.location.toLowerCase().includes(locStr)
      );
    }

    if (minHours) {
      const minH = parseFloat(String(minHours));
      volunteersList = volunteersList.filter((v: any) => 
        v.hoursCompleted >= minH
      );
    }

    return res.status(200).json(volunteersList);
  } catch (error: any) {
    console.error('Get volunteers error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET single volunteer details
export const getVolunteerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const volunteerSnap = await db.collection('volunteers').doc(id).get();
    if (!volunteerSnap.exists) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    const volunteerData = volunteerSnap.data();
    
    // Fetch associated User
    const userSnap = await db.collection('users').doc(volunteerData.userId).get();
    const userData = userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null;

    // Fetch volunteer Tasks
    const tasksSnapshot = await db.collection('tasks').where('assignedVolunteerId', '==', id).get();
    const tasks = tasksSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Fetch registered Events
    const eventsSnapshot = await db.collection('events').get();
    const events = eventsSnapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .filter((ev: any) => ev.volunteerIds && ev.volunteerIds.includes(id));

    // Fetch Certificates
    const certSnapshot = await db.collection('certificates').where('volunteerId', '==', id).get();
    const certificates = certSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    const profile = {
      id,
      ...volunteerData,
      user: userData,
      tasks,
      events,
      certificates
    };

    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('Get volunteer by ID error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET Leaderboard
export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const volunteersSnapshot = await db.collection('volunteers').where('status', '==', 'approved').get();
    const usersSnapshot = await db.collection('users').get();

    const usersMap = new Map<string, any>();
    usersSnapshot.docs.forEach((doc: any) => {
      usersMap.set(doc.id, doc.data());
    });

    const leaderboard = volunteersSnapshot.docs.map((doc: any) => {
      const volData = doc.data();
      const user = usersMap.get(volData.userId) || null;
      return {
        id: doc.id,
        name: user ? user.name : 'Unknown Volunteer',
        profileImage: user ? user.profileImage : '',
        hoursCompleted: volData.hoursCompleted || 0,
        skills: volData.skills || '',
        location: volData.location || ''
      };
    });

    // Sort by hoursCompleted descending
    leaderboard.sort((a: any, b: any) => b.hoursCompleted - a.hoursCompleted);

    return res.status(200).json(leaderboard);
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// PUT Update volunteer
export const updateVolunteer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      age,
      gender,
      address,
      occupation,
      skills,
      interests,
      availability,
      location,
      hoursCompleted,
      status
    } = req.body;

    const volunteerRef = db.collection('volunteers').doc(id);
    const volunteerSnap = await volunteerRef.get();
    if (!volunteerSnap.exists) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    const currentVolData = volunteerSnap.data();
    const userId = currentVolData.userId;

    // Update User Record if fields provided
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const user = userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null;

    if (user) {
      const updatedUserFields: any = {};
      if (name !== undefined) updatedUserFields.name = name;
      if (phone !== undefined) updatedUserFields.phone = phone;
      if (Object.keys(updatedUserFields).length > 0) {
        await userRef.update(updatedUserFields);
      }
    }

    // Update Volunteer fields
    const updatedVolFields: any = {};
    if (age !== undefined) updatedVolFields.age = age ? parseInt(String(age)) : null;
    if (gender !== undefined) updatedVolFields.gender = gender;
    if (address !== undefined) updatedVolFields.address = address;
    if (occupation !== undefined) updatedVolFields.occupation = occupation;
    if (skills !== undefined) updatedVolFields.skills = skills;
    if (interests !== undefined) updatedVolFields.interests = interests;
    if (availability !== undefined) updatedVolFields.availability = availability;
    if (location !== undefined) updatedVolFields.location = location;
    if (hoursCompleted !== undefined) updatedVolFields.hoursCompleted = parseFloat(String(hoursCompleted));

    // Handle Status Change Approval trigger
    const statusChanged = status !== undefined && status !== currentVolData.status;
    if (statusChanged) {
      updatedVolFields.status = status;
    }

    await volunteerRef.update(updatedVolFields);

    if (statusChanged && user) {
      const isApproved = status === 'approved';
      await sendApprovalEmail(user.email, user.name, isApproved);
      await sendRealTimeNotification(userId, `Your volunteer profile has been ${status}.`, 'profile_status');
    }

    await logActivity(req.user?.id || 'SYSTEM', 'Update Volunteer Profile', `Updated volunteer profile: ${name || user?.name}`);

    return res.status(200).json({ message: 'Volunteer profile updated successfully' });
  } catch (error: any) {
    console.error('Update volunteer error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// DELETE Volunteer profile
export const deleteVolunteer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const volunteerRef = db.collection('volunteers').doc(id);
    const volunteerSnap = await volunteerRef.get();
    if (!volunteerSnap.exists) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    const { userId } = volunteerSnap.data();

    // 1. Delete associated User document
    await db.collection('users').doc(userId).delete();

    // 2. Delete Volunteer document
    await volunteerRef.delete();

    // 3. Delete assigned tasks
    const tasksSnapshot = await db.collection('tasks').where('assignedVolunteerId', '==', id).get();
    for (const doc of tasksSnapshot.docs) {
      await db.collection('tasks').doc(doc.id).delete();
    }

    // 4. Remove volunteer from registered events list
    const eventsSnapshot = await db.collection('events').get();
    for (const doc of eventsSnapshot.docs) {
      const eventData = doc.data();
      if (eventData.volunteerIds && eventData.volunteerIds.includes(id)) {
        const filteredVols = eventData.volunteerIds.filter((vId: string) => vId !== id);
        await db.collection('events').doc(doc.id).update({ volunteerIds: filteredVols });
      }
    }

    // 5. Delete certificates
    const certSnapshot = await db.collection('certificates').where('volunteerId', '==', id).get();
    for (const doc of certSnapshot.docs) {
      await db.collection('certificates').doc(doc.id).delete();
    }

    await logActivity(req.user?.id || 'SYSTEM', 'Delete Volunteer Profile', `Deleted volunteer profile: ${id}`);

    return res.status(200).json({ message: 'Volunteer deleted successfully' });
  } catch (error: any) {
    console.error('Delete volunteer error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Helper tokenization for Jaccard AI matching
const tokenize = (text: string): Set<string> => {
  if (!text) return new Set();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, '')
    .split(/[\s,]+/)
    .filter(w => w.length > 2);
  return new Set(words);
};

// GET AI Matching Volunteers
export const getMatchingVolunteers = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;

    const eventSnap = await db.collection('events').doc(eventId).get();
    if (!eventSnap.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = eventSnap.data();
    const eventKeywords = tokenize(`${event.title} ${event.description}`);

    const volunteersSnapshot = await db.collection('volunteers').where('status', '==', 'approved').get();
    const usersSnapshot = await db.collection('users').get();

    const usersMap = new Map<string, any>();
    usersSnapshot.docs.forEach((doc: any) => {
      usersMap.set(doc.id, doc.data());
    });

    const matchingList = volunteersSnapshot.docs.map((doc: any) => {
      const volData = doc.data();
      const user = usersMap.get(volData.userId) || null;

      // Extract skills and interests
      const volKeywords = tokenize(`${volData.skills} ${volData.interests}`);

      // Calculate Jaccard similarity coefficient
      let matchScore = 0;
      if (eventKeywords.size > 0 || volKeywords.size > 0) {
        const intersection = new Set([...eventKeywords].filter(x => volKeywords.has(x)));
        const union = new Set([...eventKeywords, ...volKeywords]);
        matchScore = Math.round((intersection.size / union.size) * 100);
      }

      return {
        id: doc.id,
        name: user ? user.name : 'Unknown Volunteer',
        email: user ? user.email : '',
        profileImage: user ? user.profileImage : '',
        skills: volData.skills || '',
        location: volData.location || '',
        matchScore
      };
    });

    // Sort by match score descending
    matchingList.sort((a: any, b: any) => b.matchScore - a.matchScore);

    return res.status(200).json(matchingList);
  } catch (error: any) {
    console.error('Get matching volunteers error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};