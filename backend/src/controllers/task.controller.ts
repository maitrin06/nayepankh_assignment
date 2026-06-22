import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../utils/firebase';
import { logActivity } from '../utils/activity';
import { sendTaskAssignmentEmail } from '../utils/nodemailer';
import { sendRealTimeNotification } from '../utils/socket';

// GET all tasks
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const volunteerId = req.user?.volunteerId;

    let query: any = db.collection('tasks');
    if (role === 'volunteer') {
      if (!volunteerId) {
        return res.status(200).json([]);
      }
      query = query.where('assignedVolunteerId', '==', volunteerId);
    }

    const tasksSnapshot = await query.get();
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

    const tasksList = tasksSnapshot.docs.map((doc: any) => {
      const taskData = doc.data();
      const assignedVolunteer = volsMap.get(taskData.assignedVolunteerId) || null;
      return {
        id: doc.id,
        ...taskData,
        assignedVolunteer
      };
    });

    return res.status(200).json(tasksList);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Create Task (Admin Only)
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, deadline, assignedVolunteerId } = req.body;

    if (!title || !description || !deadline || !assignedVolunteerId) {
      return res.status(400).json({ message: 'All details are required to assign a task.' });
    }

    const volunteerRef = db.collection('volunteers').doc(assignedVolunteerId);
    const volunteerSnap = await volunteerRef.get();
    if (!volunteerSnap.exists) {
      return res.status(404).json({ message: 'Assigned volunteer not found.' });
    }

    const taskId = 'task-' + Math.random().toString(36).substring(7);
    const newTask = {
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      status: 'Pending',
      assignedVolunteerId
    };

    await db.collection('tasks').doc(taskId).set(newTask);

    // Send notifications to volunteer
    const volunteer = volunteerSnap.data();
    const userSnap = await db.collection('users').doc(volunteer.userId).get();
    
    if (userSnap.exists) {
      const user = userSnap.data();
      await sendTaskAssignmentEmail(user.email, user.name, title, deadline);
      await sendRealTimeNotification(volunteer.userId, `New task assigned: ${title}`, 'task_assigned');
    }

    await logActivity(req.user?.id || 'SYSTEM', 'Create Task', `Created and assigned task: ${title} to volunteer: ${assignedVolunteerId}`);

    return res.status(201).json({ id: taskId, ...newTask });
  } catch (error: any) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Update Task Status & Details
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, title, description, deadline, assignedVolunteerId } = req.body;

    const taskRef = db.collection('tasks').doc(id);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const currentTask = taskSnap.data();

    // STRICT PERMISSION CHECK: Only Admin can mark task as Completed
    if (status === 'Completed' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only coordinators / administrators can mark tasks as completed.' });
    }

    const updatedFields: any = {};
    if (status !== undefined) updatedFields.status = status;
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (deadline !== undefined) updatedFields.deadline = new Date(deadline).toISOString();
    if (assignedVolunteerId !== undefined) updatedFields.assignedVolunteerId = assignedVolunteerId;

    await taskRef.update(updatedFields);

    // If transitioned to Completed, credit volunteer with +2.0 hours
    if (status === 'Completed' && currentTask.status !== 'Completed') {
      const volunteerRef = db.collection('volunteers').doc(currentTask.assignedVolunteerId);
      const volSnap = await volunteerRef.get();
      if (volSnap.exists) {
        const volData = volSnap.data();
        const currentHours = volData.hoursCompleted || 0;
        await volunteerRef.update({ hoursCompleted: currentHours + 2.0 });

        await sendRealTimeNotification(volData.userId, `Task "${currentTask.title}" marked Completed. +2.0 hours credited!`, 'task_completed');
      }
    }

    await logActivity(req.user?.id || 'SYSTEM', 'Update Task', `Updated task: ${currentTask.title} to status: ${status || currentTask.status}`);

    return res.status(200).json({ message: 'Task updated successfully' });
  } catch (error: any) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Delete Task (Admin Only)
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const taskRef = db.collection('tasks').doc(id);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await taskRef.delete();
    await logActivity(req.user?.id || 'SYSTEM', 'Delete Task', `Deleted task ID: ${id}`);

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};