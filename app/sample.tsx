// import Image from 'next/image';
// import React, {useState, useEffect, useRef} from 'react';

// type FormData = {
//     // For individuals
//     fullName: string;
//     email: string;
//     // For businesss
//     businessName?: string;
//     businessEmail?: string;
//     password: string;
//     confirmPassword: string;
//     // Step 2 fields (same for both flows)
//     dateOfBirth: string;
//     address: string;
//     investmentAppetite: string;
//     preferredPortfolioTypes: string[];
//     // Account type
//     userType: "individual" | "business";
//     // Step 3 (only for personal flow)
//     investmentAmount: string;
//     investmentType: string;
//     investmentDuration: string;
//     // Step 4 (only for personal flow)
//     bankName: string;
//     accountNumber: string;
//     bankCode: string;
//     // Step 5 fields
//     files: File[];
// };

// type StepFiveProps = {
//     data: FormData;
//     onNext: (data: Partial<FormData>) => void;
// };

// interface UploadedFile {
//     file: File;
//     previewUrl: string;  // For images
//     progress: number;    // 0-100
//     error?: string;      // Error message if invalid
// }

// const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
// const MAX_FILE_SIZE = 5 * 1024 * 1024;

// function StepFive({ data, onNext }: StepFiveProps) {
//     // For real file uploads, you'd store and manage files in state
//     const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

//     useEffect(() => {
//         // Initialize from parent's data.files
//         const initialFiles = data.files.map(file => ({
//             file,
//             previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
//             progress: 100,
//             error: undefined
//         }));
//         setUploadedFiles(initialFiles);
//     }, [data.files]);

//     const handleProceed = () => {
//         const files = uploadedFiles.map(uf => uf.file);
//         onNext({ files });
//     };

//     // Handle file input change
//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { files } = e.target;
//         if (!files) return;

//         const newFiles: UploadedFile[] = [];

//         // Convert FileList to an array
//         Array.from(files).forEach((file) => {
//             // Validate file type
//             if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//                 newFiles.push({
//                     file,
//                     previewUrl: "",
//                     progress: 0,
//                     error: "Unsupported file type",
//                 });
//                 return;
//             }

//             // Validate file size
//             if (file.size > MAX_FILE_SIZE) {
//                 newFiles.push({
//                     file,
//                     previewUrl: "",
//                     progress: 0,
//                     error: "File size exceeds 5MB limit",
//                 });
//                 return;
//             }

//             // Create a preview URL if it's an image
//             let previewUrl = "";
//             if (file.type === "image/jpeg" || file.type === "image/png") {
//                 previewUrl = URL.createObjectURL(file);
//             }

//             newFiles.push({
//                 file,
//                 previewUrl,
//                 progress: 0,
//             });
//         });

//         // Add the new files to state
//         setUploadedFiles((prev) => [...prev, ...newFiles]);

//         // Reset the input value so user can re-upload the same file if needed
//         e.target.value = "";
//     };

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setUploadedFiles((prev) =>
//                 prev.map((f) => {
//                     // Skip errored files or completed ones
//                     if (f.error || f.progress >= 100) return f;

//                     const newProgress = f.progress + 10;
//                     return { ...f, progress: Math.min(newProgress, 100) };
//                 })
//             );
//         }, 500); // increments progress every 0.5s

//         return () => clearInterval(interval);
//     }, []);

//     // Remove a file from the list
//     const removeFile = (index: number) => {
//         setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
//     };

//     return (
//         <div>
//             {/* Card Container */}
//             <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-md border-2 border-[#D2AEFF] p-9">
//                 {/* Heading */}
//                 <h1 className="text-2xl font-bold mb-2 text-black">KYC Documents</h1>
//                 <p className="text-sm text-gray-500 mb-6">
//                     Upload the following documents to verify your KYC
//                 </p>

//                 {/* List of Required Documents */}
//                 <div className="mb-6">
//                     <h2 className="text-base font-semibold text-black mb-2">
//                         Documents required
//                     </h2>
//                     {data.accountType === "Personal Account" ?
//                         <ul className="list-disc ml-5 space-y-1 text-gray-700 text-sm">
//                             <li>Government ID</li>
//                             <li>Proof of Address</li>
//                             <li>Selfie Verification</li>
//                         </ul> :
//                         data.accountType === "Business Account" &&
//                         <ul className="list-disc ml-5 space-y-1 text-gray-700 text-sm">
//                             <li>Certificate Of Incorporation</li>
//                             <li>Valid ID of Business Owner</li>
//                             <li>Proof of Business Address</li>
//                             <li>Selfie Verification</li>
//                         </ul>
//                     }
//                 </div>

//                 {/* Upload Document Section */}
//                 <div className="mb-6">
//                     <label
//                         htmlFor="uploadDocument"
//                         className="block text-base font-medium text-black mb-2"
//                     >
//                         Upload Document
//                     </label>
//                     <div className="relative border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer text-gray-500 flex flex-col items-center">
//                         <Image
//                             src={"/icon.svg"}
//                             alt=""
//                             width={32}
//                             height={32}
//                             className=""
//                         />
//                         <p className="font-medium">Click to upload</p>
//                         <p className="text-xs">Supported file includes JPG, PNG, PDF</p>
//                         <input
//                             type="file"
//                             id="uploadDocument"
//                             multiple
//                             onChange={handleFileChange} // Uncomment to handle actual file uploads
//                             className="absolute inset-0 opacity-0 cursor-pointer"
//                         />
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">
//                         Note: Acceptable document must be less than 3 months old
//                     </p>
//                 </div>

//                 {/* Example: Preview of an uploaded file */}
//                 <div className="space-y-4 mb-6">
//                     {uploadedFiles.map((fileObj, index) => (
//                         <div
//                             key={index}
//                             className="border rounded-md p-3 flex items-center gap-3 relative"
//                         >
//                             {/* If it's an image and no error, show preview */}
//                             {!fileObj.error && fileObj.previewUrl ? (
//                                 <Image
//                                     src={fileObj.previewUrl}
//                                     alt={fileObj.file.name}
//                                     className="w-12 h-12 object-cover rounded"
//                                     width={48}
//                                     height={48}
//                                 />
//                             ) : (
//                                 // Otherwise, show PDF icon or error icon
//                                 <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-500 rounded">
//                                     {fileObj.file.type === "application/pdf" && !fileObj.error ? (
//                                         <svg
//                                             xmlns="http://www.w3.org/2000/svg"
//                                             className="w-6 h-6"
//                                             fill="none"
//                                             viewBox="0 0 24 24"
//                                             stroke="currentColor"
//                                             strokeWidth={2}
//                                         >
//                                             <path
//                                                 strokeLinecap="round"
//                                                 strokeLinejoin="round"
//                                                 d="M12 4v16m8-8H4"
//                                             />
//                                         </svg>
//                                     ) : (
//                                         // Show error or a generic icon
//                                         <svg
//                                             xmlns="http://www.w3.org/2000/svg"
//                                             className="w-6 h-6 text-red-500"
//                                             fill="none"
//                                             viewBox="0 0 24 24"
//                                             stroke="currentColor"
//                                             strokeWidth={2}
//                                         >
//                                             <path
//                                                 strokeLinecap="round"
//                                                 strokeLinejoin="round"
//                                                 d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
//                                             />
//                                         </svg>
//                                     )}
//                                 </div>
//                             )}

//                             {/* File details */}
//                             <div className="flex-1">
//                                 <p className="text-sm font-medium text-gray-700 truncate">
//                                     {fileObj.file.name}
//                                 </p>
//                                 <p className="text-xs text-gray-400">
//                                     {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
//                                 </p>
//                                 {fileObj.error ? (
//                                     <p className="text-xs text-red-500 font-medium mt-1">
//                                         {fileObj.error}
//                                     </p>
//                                 ) : (
//                                     <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//                                         <div
//                                             className="bg-purple-500 h-2 rounded-full"
//                                             style={{ width: `${fileObj.progress}%` }}
//                                         />
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Delete icon & progress text */}
//                             <div className="flex items-center space-x-2 text-gray-500">
//                                 <button
//                                     className="focus:outline-none hover:text-red-600"
//                                     title="Remove"
//                                     onClick={() => removeFile(index)}
//                                 >
//                                     <svg
//                                         className="w-5 h-5"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth={2}
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m-4 0h12"
//                                         />
//                                     </svg>
//                                 </button>
//                                 {!fileObj.error && (
//                                     <span className="text-sm text-gray-400">{fileObj.progress}%</span>
//                                 )}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Proceed Button */}
//                 <button
//                     type="button"
//                     className={`w-full text-white py-2 rounded-md font-medium ${uploadedFiles.length === 0 ? "bg-[#D9D9D9]" : "bg-[#8627FF]"}`}
//                     disabled={uploadedFiles.length === 0}
//                     onClick={handleProceed}
//                 >
//                     Proceed
//                 </button>
//             </div>
//         </div>
//     );
// }