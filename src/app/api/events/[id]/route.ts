// src/app/api/events/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Event from '@/models/Event'

// Inisialisasi koneksi database
dbConnect()

/**
 * GET  /api/events/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params    // tunggu hingga params ter-resolve :contentReference[oaicite:0]{index=0}

  try {
    const event = await Event.findById(id)
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error('Error fetching event by ID:', error)
    return NextResponse.json(
      { message: 'Failed to retrieve event', error },
      { status: 500 }
    )
  }
}

/**
 * PUT  /api/events/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  try {
    const body = await req.json()
    const { name, date, time, location, ipnuAttendees, ippnuAttendees } = body

    if (!name || !date || !time || !location) {
      return NextResponse.json(
        { message: 'Event name, date, time, and location are required.' },
        { status: 400 }
      )
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        name,
        date,
        time,
        location,
        ipnuAttendees: ipnuAttendees || [],
        ippnuAttendees: ippnuAttendees || [],
      },
      { new: true, runValidators: true }
    )

    if (!updatedEvent) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedEvent, { status: 200 })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { message: 'Failed to update event', error },
      { status: 500 }
    )
  }
}

/**
 * DELETE  /api/events/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  try {
    const deletedEvent = await Event.findByIdAndDelete(id)
    if (!deletedEvent) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { message: 'Event successfully deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { message: 'Failed to delete event', error },
      { status: 500 }
    )
  }
}
