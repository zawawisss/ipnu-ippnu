import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ArsipMasuk from "@/models/ArsipMasuk";
import { checkAdminSession } from "@/lib/checkAdminSession";

// Helper function to handle common logic like session check and db connection
const handleRequest = (handler: (request: NextRequest) => Promise<NextResponse>) => {
  return async (request: NextRequest) => {
    try {
      const session = await checkAdminSession();
      if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      await dbConnect();

      // Execute the actual handler logic which returns a Promise
      return handler(request);

    } catch (error) {
      console.error("Unhandled error in API route:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
};

export const GET = handleRequest((request: NextRequest): Promise<NextResponse> => {
  // Return a new Promise that encapsulates the GET logic
  return new Promise((resolve, reject) => {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search") || "";

    let query: any = {};
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      query = {
        $or: [
          { nomor_surat: { $regex: regex } },
          { pengirim: { $regex: regex } },
          { perihal: { $regex: regex } },
        ],
      };
    }

    // Mongoose find returns a Promise, so we can use .then() and .catch()
    ArsipMasuk.find(query)
      .then(arsipMasuk => {
        // Resolve the main Promise with the successful response
        resolve(NextResponse.json(arsipMasuk));
      })
      .catch(error => {
        // Reject the main Promise with the error
        console.error("Error fetching arsip masuk:", error);
        resolve( // Resolve with an error response
          NextResponse.json(
            { message: "Error fetching data" },
            { status: 500 }
          )
        );
      });
  });
});

export const POST = handleRequest((request: NextRequest): Promise<NextResponse> => {
  // Return the Promise chain from processing the request body and saving
  return request.json()
    .then(body => {
      const { no, nomor_surat, pengirim, perihal, tanggal_surat } = body;

      const newArsipMasuk = new ArsipMasuk({
        no,
        nomor_surat,
        pengirim,
        perihal,
        tanggal_surat,
      });

      // Mongoose save returns a Promise
      return newArsipMasuk.save();
    })
    .then(savedArsipMasuk => {
      // Return the success response
      return NextResponse.json(savedArsipMasuk);
    })
    .catch(error => {
      // Handle errors during JSON parsing or saving
      console.error("Error saving arsip masuk:", error);
      return NextResponse.json({ message: "Error saving data" }, { status: 500 });
    });
});


export const DELETE = handleRequest((request: NextRequest): Promise<NextResponse> => {
  // Return a new Promise to handle the DELETE logic
  return new Promise((resolve, reject) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      // Resolve with a client error response
      resolve(
        NextResponse.json(
          { message: "Missing id parameter" },
          { status: 400 }
        )
      );
      return; // Stop further execution
    }

    // Mongoose findByIdAndDelete returns a Promise
    ArsipMasuk.findByIdAndDelete(id)
      .then(deletedArsipMasuk => {
        if (!deletedArsipMasuk) {
          // Resolve with a not found response
          resolve(
            NextResponse.json(
              { message: "Arsip Masuk not found" },
              { status: 404 }
            )
          );
        } else {
          // Resolve with a success response
          resolve(NextResponse.json({ message: "Arsip Masuk deleted successfully" }));
        }
      })
      .catch(error => {
        // Handle errors during deletion
        console.error("Error deleting arsip masuk:", error);
        resolve( // Resolve with an error response
          NextResponse.json(
            { message: "Error deleting data" },
            { status: 500 }
          )
        );
      });
  });
});