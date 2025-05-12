// "use client";

// import React, { useState, useEffect } from 'react';

// export default function SuratArchivePage() {
//   const [archivedLetters, setArchivedLetters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     // Fetch archived letters from API
//     const fetchArchivedLetters = async () => {
//       try {
//         const response = await fetch('/api/archive/surat'); // Placeholder API route
//         if (!response.ok) {
//           throw new Error('Failed to fetch archived letters');
//         }
//         const data = await response.json();
//         setArchivedLetters(data);
//       } catch (err: any) {
//         setError(`Error fetching archived letters: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchArchivedLetters();
//   }, []);

//   const handleDownloadPdf = async (letter: any) => {
//     setLoading(true); // Use a separate loading state if needed, or disable the specific button
//     setError('');

//     try {
//       const response = await fetch('/api/generate-pdf', { // Reuse the generate-pdf API
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ letterData: letter.formData }), // Send the stored form data
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to generate PDF');
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `surat_tugas_${letter.letterNumber.replace(/\//g, '_')}.pdf`; // Dynamic filename
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);

//     } catch (err: any) {
//       console.error('Error generating PDF:', err);
//       setError(`Failed to generate PDF: ${err.message}`);
//     } finally {
//       setLoading(false); // Reset loading state
//     }
//   };


//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Arsip Surat Tugas</h1>
//       {loading && <p>Loading archived letters...</p>}
//       {error && <p className="text-red-500">{error}</p>}
//       {!loading && !error && archivedLetters.length === 0 && (
//         <p>No archived letters found.</p>
//       )}
//       {!loading && !error && archivedLetters.length > 0 && (
//         <ul>
//           {/* Placeholder for displaying archived letters */}
//           {archivedLetters.map((letter: any) => (
//             <li key={letter._id} className="mb-2 p-2 border rounded-md flex justify-between items-center">
//               <span>{letter.letterNumber} - {letter.letterType}</span>
//               <button
//                 onClick={() => handleDownloadPdf(letter)}
//                 className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-1 px-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
//               >
//                 Download PDF
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
