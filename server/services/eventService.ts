// ============================================
// Event Service - Prisma Optimized
// Features:
// - Get events by month (CRITICAL QUERY)
// - Pagination
// - Filter by category
// - CRITICAL INDEX: Event(year, month)
// ============================================

import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export interface EventInput {
  title: string;
  description?: string;
  date: string; // ISO date
  categories?: string[];
  location?: string;
  capacity?: number;
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  link?: string;
}

// ============================================
// QUERIES
// ============================================

/**
 * Get events by month and year
 * CRITICAL INDEX: Event(year, month)
 * Used frequently for month view
 */
export async function getEventsByMonth(
  year: number,
  month: number,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: {
        year,
        month,
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        categories: true,
        location: true,
        registeredCount: true,
        capacity: true,
        status: true,
        link: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { date: 'asc' },
    }),
    prisma.event.count({
      where: { year, month },
    }),
  ]);

  return {
    data: events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get events by month range
 * For displaying calendar view (3-6 months)
 */
export async function getEventsByMonthRange(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
) {
  // Build where clause for date range
  let where: Prisma.EventWhereInput = {};

  if (startYear === endYear) {
    where = {
      year: startYear,
      month: {
        gte: startMonth,
        lte: endMonth,
      },
    };
  } else {
    where = {
      OR: [
        {
          year: startYear,
          month: { gte: startMonth },
        },
        {
          year: endYear,
          month: { lte: endMonth },
        },
        {
          year: {
            gt: startYear,
            lt: endYear,
          },
        },
      ],
    };
  }

  return prisma.event.findMany({
    where,
    select: {
      id: true,
      title: true,
      date: true,
      month: true,
      year: true,
      categories: true,
      status: true,
    },
    orderBy: { date: 'asc' },
  });
}

/**
 * Get events by category
 * For filtering by interest (ethics, study, volunteer, etc)
 */
export async function getEventsByCategory(
  category: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: {
        categories: {
          has: category.toLowerCase(),
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        month: true,
        year: true,
        categories: true,
        location: true,
        status: true,
        link: true,
      },
      skip,
      take: limit,
      orderBy: { date: 'asc' },
    }),
    prisma.event.count({
      where: {
        categories: {
          has: category.toLowerCase(),
        },
      },
    }),
  ]);

  return {
    data: events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get upcoming events
 * CRITICAL INDEX: Event(status, date)
 */
export async function getUpcomingEvents(
  limit: number = 10
) {
  return prisma.event.findMany({
    where: {
      status: { in: ['UPCOMING', 'ONGOING'] },
      date: { gte: new Date() },
    },
    select: {
      id: true,
      title: true,
      date: true,
      categories: true,
      location: true,
      status: true,
    },
    orderBy: { date: 'asc' },
    take: limit,
  });
}

/**
 * Get event detail
 */
export async function getEventDetail(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
  });
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Create event
 */
export async function createEvent(input: EventInput) {
  const date = new Date(input.date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return prisma.event.create({
    data: {
      title: input.title,
      description: input.description,
      date,
      year,
      month,
      categories: input.categories?.map(c => c.toLowerCase()) || [],
      location: input.location,
      capacity: input.capacity,
      status: input.status || 'UPCOMING',
      link: input.link,
    },
  });
}

/**
 * Update event
 */
export async function updateEvent(eventId: string, input: Partial<EventInput>) {
  const updateData: any = {};

  if (input.title) updateData.title = input.title;
  if (input.description) updateData.description = input.description;
  if (input.date) {
    const date = new Date(input.date);
    updateData.date = date;
    updateData.year = date.getFullYear();
    updateData.month = date.getMonth() + 1;
  }
  if (input.categories) updateData.categories = input.categories.map((c: string) => c.toLowerCase());
  if (input.location) updateData.location = input.location;
  if (input.capacity !== undefined) updateData.capacity = input.capacity;
  if (input.status) updateData.status = input.status;
  if (input.link) updateData.link = input.link;

  return prisma.event.update({
    where: { id: eventId },
    data: updateData,
  });
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string) {
  return prisma.event.delete({
    where: { id: eventId },
  });
}

/**
 * Update event status
 */
export async function updateEventStatus(
  eventId: string,
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
) {
  return prisma.event.update({
    where: { id: eventId },
    data: { status },
  });
}

/**
 * Increment registered count
 */
export async function incrementEventRegistration(eventId: string) {
  return prisma.event.update({
    where: { id: eventId },
    data: {
      registeredCount: { increment: 1 },
    },
  });
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get events statistics by month
 */
export async function getEventStatsByMonth(year: number, month: number) {
  const events = await prisma.event.findMany({
    where: { year, month },
    select: {
      status: true,
      registeredCount: true,
      capacity: true,
    },
  });

  const total = events.length;
  const upcoming = events.filter(e => e.status === 'UPCOMING').length;
  const ongoing = events.filter(e => e.status === 'ONGOING').length;
  const completed = events.filter(e => e.status === 'COMPLETED').length;
  const totalRegistered = events.reduce((sum, e) => sum + e.registeredCount, 0);

  return {
    year,
    month,
    total,
    upcoming,
    ongoing,
    completed,
    totalRegistered,
  };
}

/**
 * Get all months with events
 * For displaying available months in UI
 */
export async function getMonthsWithEvents() {
  const months = await prisma.event.findMany({
    select: {
      year: true,
      month: true,
    },
    distinct: ['year', 'month'],
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  return months;
}

/**
 * Get all categories
 */
export async function getAllEventCategories() {
  const events = await prisma.event.findMany({
    select: { categories: true },
  });

  const allCategories = new Set<string>();
  events.forEach(event => {
    event.categories.forEach(cat => allCategories.add(cat));
  });

  return Array.from(allCategories).sort();
}
