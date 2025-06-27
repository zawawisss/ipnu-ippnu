import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event'; // Import model Event

// Connect to the database
dbConnect();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params; 

  return new Promise<NextResponse>((resolve, reject) => {
    Event.findById(id) // Find the event by its ID in the database, which returns a Promise
      .then(event => {
        // If no event is found, resolve with a 404 Not Found response
        if (!event) {
          resolve(NextResponse.json({ message: 'Event not found' }, { status: 404 }));
        } else {
          // If event is found, resolve with it and a 200 OK status
          resolve(NextResponse.json(event, { status: 200 }));
        }
      })
      .catch(error => {
        // Catch any errors that occur during the find operation
        console.error('Error fetching event by ID:', error);
        // Resolve with a 500 Internal Server Error response if an error occurs
        resolve(NextResponse.json({ message: 'Failed to retrieve event', error }, { status: 500 }));
      });
  });
}

// Handler for PUT request (to update an existing event)
// The 'params' object is directly destructured from the second argument.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params; // Access 'id' directly from the destructured params object

  // Return a new Promise for the PUT operation
  return new Promise<NextResponse>((resolve, reject) => {
    req.json() // Parse the request body as JSON, which returns a Promise
      .then(body => {
        const { name, date, time, location, ipnuAttendees, ippnuAttendees } = body;

        // Basic input validation: ensure required fields are present
        if (!name || !date || !time || !location) {
          resolve(NextResponse.json({ message: 'Event name, date, time, and location are required.' }, { status: 400 }));
          return;
        }

        Event.findByIdAndUpdate( // Find and update the event by ID, which returns a Promise
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
        )
          .then(updatedEvent => {
            // If no event is found with the given ID, resolve with a 404 Not Found response
            if (!updatedEvent) {
              resolve(NextResponse.json({ message: 'Event not found' }, { status: 404 }));
            } else {
              // If update is successful, resolve with the updated event and a 200 OK status
              resolve(NextResponse.json(updatedEvent, { status: 200 }));
            }
          })
          .catch(error => {
            // Catch any errors that occur during the update operation
            console.error('Error updating event:', error);
            // Resolve with a 500 Internal Server Error response if an error occurs
            resolve(NextResponse.json({ message: 'Failed to update event', error }, { status: 500 }));
          });
      })
      .catch(error => {
        // Catch any errors that occur during JSON parsing
        console.error('Error parsing request body:', error);
        resolve(NextResponse.json({ message: 'Invalid request body', error }, { status: 400 }));
      });
  });
}

// Handler for DELETE request (to delete an event)
// The 'params' object is directly destructured from the second argument.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params; // Access 'id' directly from the destructured params object

  // Return a new Promise for the DELETE operation
  return new Promise<NextResponse>((resolve, reject) => {
    Event.findByIdAndDelete(id) // Find and delete the event by its ID, which returns a Promise
      .then(deletedEvent => {
        // If no event is found with the given ID, resolve with a 404 Not Found response
        if (!deletedEvent) {
          resolve(NextResponse.json({ message: 'Event not found' }, { status: 404 }));
        } else {
          // If deletion is successful, resolve with a success message and a 200 OK status
          resolve(NextResponse.json({ message: 'Event successfully deleted' }, { status: 200 }));
        }
      })
      .catch(error => {
        // Catch any errors that occur during the delete operation
        console.error('Error deleting event:', error);
        // Resolve with a 500 Internal Server Error response if an error occurs
        resolve(NextResponse.json({ message: 'Failed to delete event', error }, { status: 500 }));
      });
  });
}
