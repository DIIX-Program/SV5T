import Event from '../models/Event.js';

/**
 * Get all events (both upcoming and past)
 */
export const getAllEvents = async (req, res) => {
  try {
    const { month, year, status, category } = req.query;
    const filter = {};

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;
    if (category) filter.categories = { $in: [category] };

    const events = await Event.find(filter)
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      events,
      total: events.length
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
};

/**
 * Get events by month and year
 */
export const getEventsByMonth = async (req, res) => {
  try {
    const { month, year } = req.params;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Month must be between 1 and 12'
      });
    }

    const events = await Event.find({
      month: monthNum,
      year: yearNum,
      isArchived: false
    })
      .sort({ date: 1 })
      .lean();

    res.status(200).json({
      success: true,
      month: monthNum,
      year: yearNum,
      events,
      total: events.length
    });
  } catch (error) {
    console.error('Get events by month error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const now = new Date();

    const events = await Event.find({
      date: { $gte: now },
      status: 'upcoming',
      isArchived: false
    })
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming events'
    });
  }
};

/**
 * Get event archive (past events)
 */
export const getEventArchive = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const now = new Date();

    const events = await Event.find({
      date: { $lt: now },
      isArchived: true
    })
      .sort({ date: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const total = await Event.countDocuments({
      date: { $lt: now },
      isArchived: true
    });

    res.status(200).json({
      success: true,
      events,
      total,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get event archive error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event archive'
    });
  }
};

/**
 * Get event by ID (admin)
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
};

/**
 * Create event (admin only)
 */
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, categories, location, capacity, link } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and date are required'
      });
    }

    const eventDate = new Date(date);
    const month = eventDate.getMonth() + 1;
    const year = eventDate.getFullYear();

    const newEvent = new Event({
      title,
      description,
      date: eventDate,
      month,
      year,
      categories: categories || [],
      location: location || '',
      capacity: capacity || null,
      link: link || null,
      status: eventDate > new Date() ? 'upcoming' : 'completed',
      isArchived: eventDate < new Date()
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event'
    });
  }
};

/**
 * Update event (admin only)
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, categories, location, capacity, link, status } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) {
      const eventDate = new Date(date);
      event.date = eventDate;
      event.month = eventDate.getMonth() + 1;
      event.year = eventDate.getFullYear();
    }
    if (categories) event.categories = categories;
    if (location !== undefined) event.location = location;
    if (capacity !== undefined) event.capacity = capacity;
    if (link !== undefined) event.link = link;
    if (status) event.status = status;

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event'
    });
  }
};

/**
 * Delete event (admin only)
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    });
  }
};

/**
 * Archive past events (can be run as a batch job)
 */
export const archivePastEvents = async (req, res) => {
  try {
    const now = new Date();
    const result = await Event.updateMany(
      { date: { $lt: now }, isArchived: false },
      { isArchived: true, status: 'completed' }
    );

    res.status(200).json({
      success: true,
      message: 'Past events archived',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Archive events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive events'
    });
  }
};
