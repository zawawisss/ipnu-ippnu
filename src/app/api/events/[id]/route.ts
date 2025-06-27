import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event'; // Import model Event

// Define a type for the context object that Next.js provides to route handlers
// This context object contains dynamic parameters from the URL
interface Context {
  params: {
    id: string; // The dynamic segment `[id]` will be available here as 'id'
  };
}

// Connect to the database
dbConnect();

// Handler for GET request by ID (to retrieve a single event)
// The 'context' argument contains the dynamic route parameters
export async function GET(req: NextRequest, context: Context) {
  try {
    const { id } = context.params; // Destructure 'id' from context.params
    const event = await Event.findById(id); // Find the event by its ID in the database

    // If no event is found, return a 404 Not Found response
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // If event is found, return it with a 200 OK status
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    // Log any errors that occur during the fetch operation
    console.error('Error fetching event by ID:', error);
    // Return a 500 Internal Server Error response if an error occurs
    return NextResponse.json({ message: 'Failed to retrieve event', error }, { status: 500 });
  }
}

// Handler for PUT request (to update an existing event)
// The 'context' argument contains the dynamic route parameters
export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = context.params; // Destructure 'id' from context.params
    const body = await req.json(); // Parse the request body as JSON
    const { name, date, time, location, ipnuAttendees, ippnuAttendees } = body;

    // Basic input validation: ensure required fields are present
    if (!name || !date || !time || !location) {
      return NextResponse.json({ message: 'Event name, date, time, and location are required.' }, { status: 400 });
    }

    // Find and update the event by ID.
    // 'new: true' returns the updated document.
    // 'runValidators: true' ensures schema validators are run on the update.
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        name,
        date,
        time,
        location,
        ipnuAttendees: ipnuAttendees || [], // Default to empty array if not provided
        ippnuAttendees: ippnuAttendees || [], // Default to empty array if not provided
      },
      { new: true, runValidators: true }
    );

    // If no event is found with the given ID, return a 404 Not Found response
    if (!updatedEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // If update is successful, return the updated event with a 200 OK status
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    // Log any errors that occur during the update operation
    console.error('Error updating event:', error);
    // Return a 500 Internal Server Error response if an error occurs
    return NextResponse.json({ message: 'Failed to update event', error }, { status: 500 });
  }
}

// Handler for DELETE request (to delete an event)
// The 'context' argument contains the dynamic route parameters
export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = context.params; // Destructure 'id' from context.params
    const deletedEvent = await Event.findByIdAndDelete(id); // Find and delete the event by its ID

    // If no event is found with the given ID, return a 404 Not Found response
    if (!deletedEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // If deletion is successful, return a success message with a 200 OK status
    return NextResponse.json({ message: 'Event successfully deleted' }, { status: 200 });
  } catch (error) {
    // Log any errors that occur during the delete operation
    console.error('Error deleting event:', error);
    // Return a 500 Internal Server Error response if an error occurs
    return NextResponse.json({ message: 'Failed to delete event', error }, { status: 500 });
  }
}
