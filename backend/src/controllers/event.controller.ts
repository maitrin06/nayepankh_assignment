import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../utils/firebase';
import { logActivity } from '../utils/activity';
import { sendEventReminderEmail } from '../utils/nodemailer';
import { sendRealTimeNotification } from '../utils/socket';

// Create Event (Admin Only)
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, date, time, location, capacity, imageUrl } = req.body;

    if (!title || !description || !date || !time || !location || !capacity) {
      return res.status(400).json({ message: 'All event details are required.' });
    }

    const eventId = 'event-' + Math.random().toString(36).substring(7);
    const newEvent = {
      title,
      description,
      date: new Date(date).toISOString(),
      time,
      location,
      capacity: parseInt(capacity),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600',
      volunteerIds: []
    };

    await db.collection('events').doc(eventId).set(newEvent);
    await logActivity(req.user?.id || 'SYSTEM', 'Create Event', `Created event: ${title}`);

    return res.status(201).json({ id: eventId, ...newEvent });
  } catch (error: any) {
    console.error('Create event error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET all events
export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const eventsSnapshot = await db.collection('events').get();
    const volunteersSnapshot = await db.collection('volunteers').get();
    const usersSnapshot = await db.collection('users').get();

    // Map users for fast lookup
    const usersMap = new Map<string, any>();
    usersSnapshot.docs.forEach((doc: any) => {
      usersMap.set(doc.id, doc.data());
    });

    // Map volunteers for fast lookup
    const volsMap = new Map<string, any>();
    volunteersSnapshot.docs.forEach((doc: any) => {
      const volData = doc.data();
      const user = usersMap.get(volData.userId) || null;
      volsMap.set(doc.id, {
        id: doc.id,
        user: user ? {
          name: user.name,
          email: user.email,
          profileImage: user.profileImage
        } : null
      });
    });

    const eventsList = eventsSnapshot.docs.map((doc: any) => {
      const evData = doc.data();
      const registeredVols = (evData.volunteerIds || []).map((vId: string) => volsMap.get(vId)).filter(Boolean);
      return {
        id: doc.id,
        ...evData,
        volunteers: registeredVols
      };
    });

    return res.status(200).json(eventsList);
  } catch (error: any) {
    console.error('Get events error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Update Event (Admin Only)
export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, capacity, imageUrl } = req.body;

    const eventRef = db.collection('events').doc(id);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedFields: any = {};
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (date !== undefined) updatedFields.date = new Date(date).toISOString();
    if (time !== undefined) updatedFields.time = time;
    if (location !== undefined) updatedFields.location = location;
    if (capacity !== undefined) updatedFields.capacity = parseInt(capacity);
    if (imageUrl !== undefined) updatedFields.imageUrl = imageUrl;

    await eventRef.update(updatedFields);
    await logActivity(req.user?.id || 'SYSTEM', 'Update Event', `Updated event: ${title || eventSnap.data()?.title}`);

    return res.status(200).json({ message: 'Event updated successfully' });
  } catch (error: any) {
    console.error('Update event error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Delete Event (Admin Only)
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const eventRef = db.collection('events').doc(id);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await eventRef.delete();
    await logActivity(req.user?.id || 'SYSTEM', 'Delete Event', `Deleted event ID: ${id}`);

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Register for Event
export const registerVolunteer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Event ID
    const volunteerId = req.user?.volunteerId;
    const userId = req.user?.id;

    if (!volunteerId || !userId) {
      return res.status(400).json({ message: 'Only registered volunteers can sign up for events.' });
    }

    // Check volunteer application approval status
    const volunteerSnap = await db.collection('volunteers').doc(volunteerId).get();
    if (!volunteerSnap.exists) {
      return res.status(404).json({ message: 'Volunteer profile not found.' });
    }

    const volunteer = volunteerSnap.data();
    if (volunteer.status !== 'approved') {
      return res.status(403).json({ message: 'Volunteer profile must be approved by coordinator to register for events.' });
    }

    const eventRef = db.collection('events').doc(id);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = eventSnap.data();
    const currentVols = event.volunteerIds || [];

    if (currentVols.includes(volunteerId)) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    if (currentVols.length >= event.capacity) {
      return res.status(400).json({ message: 'This event has reached full capacity.' });
    }

    const updatedVols = [...currentVols, volunteerId];
    await eventRef.update({ volunteerIds: updatedVols });

    // Fetch user details for email
    const userSnap = await db.collection('users').doc(userId).get();
    if (userSnap.exists) {
      const user = userSnap.data();
      await sendEventReminderEmail(user.email, user.name, event.title, event.date);
    }

    await sendRealTimeNotification(userId, `You registered for event: ${event.title}`, 'event_registration');
    await logActivity(userId, 'Event Registration', `Registered volunteer: ${volunteerId} for event: ${event.title}`);

    return res.status(200).json({ message: 'Successfully registered for event.' });
  } catch (error: any) {
    console.error('Register for event error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Cancel Registration
export const cancelVolunteer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Event ID
    const volunteerId = req.user?.volunteerId;
    const userId = req.user?.id;

    if (!volunteerId || !userId) {
      return res.status(400).json({ message: 'Only registered volunteers can cancel event sign-ups.' });
    }

    const eventRef = db.collection('events').doc(id);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = eventSnap.data();
    const currentVols = event.volunteerIds || [];

    if (!currentVols.includes(volunteerId)) {
      return res.status(400).json({ message: 'You are not registered for this event.' });
    }

    const updatedVols = currentVols.filter((vId: string) => vId !== volunteerId);
    await eventRef.update({ volunteerIds: updatedVols });

    await sendRealTimeNotification(userId, `Cancelled registration for event: ${event.title}`, 'event_cancellation');
    await logActivity(userId, 'Event Registration Cancellation', `Volunteer ${volunteerId} cancelled registration for event: ${event.title}`);

    return res.status(200).json({ message: 'Registration cancelled successfully.' });
  } catch (error: any) {
    console.error('Cancel event registration error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Check-in Volunteer / Verify Attendance (Admin Only)
export const checkInVolunteer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Event ID
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({ message: 'Volunteer ID is required for verification.' });
    }

    const eventSnap = await db.collection('events').doc(id).get();
    if (!eventSnap.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = eventSnap.data();
    const currentVols = event.volunteerIds || [];

    if (!currentVols.includes(volunteerId)) {
      return res.status(400).json({ message: 'Volunteer is not registered for this event.' });
    }

    const volunteerRef = db.collection('volunteers').doc(volunteerId);
    const volunteerSnap = await volunteerRef.get();
    if (!volunteerSnap.exists) {
      return res.status(404).json({ message: 'Volunteer not found.' });
    }

    const volunteer = volunteerSnap.data();
    const userSnap = await db.collection('users').doc(volunteer.userId).get();
    const user = userSnap.data();

    // Check if certificate already exists
    const certQuery = await db.collection('certificates')
      .where('volunteerId', '==', volunteerId)
      .where('eventName', '==', event.title)
      .get();

    if (!certQuery.empty) {
      return res.status(400).json({ message: 'Volunteer has already been checked-in for this event.' });
    }

    // 1. Issue Certificate
    const certId = 'cert-' + Math.random().toString(36).substring(7);
    const credCode = 'vh-cert-' + Math.random().toString(36).substring(5);
    await db.collection('certificates').doc(certId).set({
      volunteerId,
      volunteerName: user ? user.name : 'Verified Volunteer',
      eventName: event.title,
      hoursCompleted: 3.0, // standard event hours
      issuedAt: new Date().toISOString(),
      verificationCode: credCode
    });

    // 2. Increment hours completed
    const currentHours = volunteer.hoursCompleted || 0;
    await volunteerRef.update({ hoursCompleted: currentHours + 3.0 });

    await sendRealTimeNotification(volunteer.userId, `Attendance verified for: ${event.title}. Certificate issued!`, 'attendance_verify');
    await logActivity(req.user?.id || 'SYSTEM', 'Verify Attendance', `Verified volunteer ${user ? user.name : volunteerId} for ${event.title}`);

    return res.status(200).json({ message: 'Attendance verified successfully. Certificate issued!' });
  } catch (error: any) {
    console.error('Verify check-in error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};