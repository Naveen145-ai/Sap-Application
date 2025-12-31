# 📊 Architecture & Data Flow Diagrams

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     STUDENT FRONTEND (React)                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             EventsForm.jsx Component                    │   │
│  │                                                         │   │
│  │  State:                                                 │   │
│  │  ├─ formData (student info)                             │   │
│  │  ├─ eventData (events + files + marks)                  │   │
│  │  └─ submissionStatus (pending/submitting/success/err)   │   │
│  │                                                         │   │
│  │  Functions:                                             │   │
│  │  ├─ handleFileUpload()     → Add files to state         │   │
│  │  ├─ removeFile()           → Remove specific file       │   │
│  │  ├─ clearCategoryFiles()   → Clear all in category      │   │
│  │  └─ submitEventData()      → Send to backend            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (POST Request)
┌─────────────────────────────────────────────────────────────────┐
│                   HTTP Request to Backend                        │
│                                                                   │
│  POST: http://localhost:8080/api/sap/submit-individual-event    │
│  Content-Type: multipart/form-data                               │
│                                                                   │
│  Body:                                                            │
│  ├─ studentInfo (JSON)                                          │
│  ├─ eventKey, eventTitle                                        │
│  ├─ eventData (counts, marks)                                   │
│  ├─ mentorEmail, email                                          │
│  └─ Files:                                                       │
│     ├─ proofs[paperPresentation][insidePresented] = File[]      │
│     ├─ proofs[paperPresentation][outsidePresented] = File[]     │
│     └─ ... (multiple files per category)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND (Node.js)                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  sapRoutes.js                                           │   │
│  │  └─ router.post('/submit-individual-event',            │   │
│  │                upload.any(),                            │   │
│  │                submitIndividualEvent)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  upload.js (Multer Middleware)                          │   │
│  │  ├─ Parses multipart/form-data                          │   │
│  │  ├─ Validates file size (10MB limit)                    │   │
│  │  ├─ Uploads to Cloudinary                               │   │
│  │  ├─ Returns file objects with URLs                      │   │
│  │  └─ Passes to controller                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  sapControllers.js::submitIndividualEvent()             │   │
│  │  ├─ Validates mentor email                              │   │
│  │  ├─ Parses student info & event data                    │   │
│  │  ├─ Maps files by category using regex                  │   │
│  │  │  Pattern: proofs[eventKey][categoryKey]              │   │
│  │  ├─ Creates proofUrlsByCategory object                  │   │
│  │  └─ Saves to MongoDB                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDINARY                                │
│                                                                   │
│  ☁️ File Storage Service (CDN)                                  │
│  ├─ Receives file from multer                                   │
│  ├─ Assigns unique URL                                          │
│  ├─ Returns URL path back to backend                            │
│  └─ Files accessible forever (or per policy)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       MONGODB                                    │
│                                                                   │
│  Database: sap_db                                                │
│  Collection: sapforms                                            │
│                                                                   │
│  Document Structure:                                             │
│  {                                                               │
│    _id: ObjectId,                                                │
│    email: "student@example.com",                                 │
│    mentorEmail: "mentor@example.com",                            │
│    name: "Student Name",                                         │
│    events: [                                                     │
│      {                                                           │
│        key: "paperPresentation",                                 │
│        title: "1. Paper Presentation",                           │
│        values: {                                                 │
│          counts: {insidePresented: 5, ...},                      │
│          studentMarks: {insidePresented: 10, ...},               │
│          proofUrlsByCategory: {                                  │
│            insidePresented: [                                    │
│              "https://cloudinary.com/...",                       │
│              "https://cloudinary.com/..."                        │
│            ],                                                    │
│            outsidePresented: [...]                               │
│          }                                                       │
│        },                                                        │
│        status: "pending"                                         │
│      }                                                           │
│    ],                                                            │
│    submittedAt: ISODate                                          │
│  }                                                               │
│                                                                   │
│  ✅ Stored for later retrieval by mentor/student                │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Upload Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      UI Interaction Flow                         │
└─────────────────────────────────────────────────────────────────┘

EVENT 1: User clicks "+ Click to Upload"
┌─────────────────┐
│ Click Upload    │
│    Button       │────────────────────┐
└─────────────────┘                    │
                                      ↓
                        ┌──────────────────────────────┐
                        │ Browser File Picker Opens     │
                        │ (Hidden input triggered)      │
                        │ Can select multiple files     │
                        └──────────────────────────────┘
                                      │
                                      │ User selects files
                                      ↓
EVENT 2: File Selection Handler
┌───────────────────────────────────────────────────────────┐
│ onChange event fires with FileList                        │
│                                                           │
│ Step 1: Extract files from event.target.files            │
│ Step 2: Call handleFileUpload(eventKey, categoryKey,     │
│                               files)                      │
│ Step 3: Reset input.value = '' (allow same file again)   │
└───────────────────────────────────────────────────────────┘
                                      ↓
EVENT 3: File Handler Function
┌───────────────────────────────────────────────────────────┐
│ handleFileUpload() {                                      │
│   1. Get existing files: prev[eventKey].files[categoryKey]│
│   2. Convert new files to array: Array.from(files)       │
│   3. Check for duplicates:                               │
│      - Compare name AND size                             │
│      - Skip if duplicate found                           │
│   4. Append to existing: [...existing, ...newFiles]      │
│   5. Update state with new file list                     │
│ }                                                        │
└───────────────────────────────────────────────────────────┘
                                      ↓
EVENT 4: State Update
┌───────────────────────────────────────────────────────────┐
│ eventData = {                                             │
│   paperPresentation: {                                   │
│     files: {                                             │
│       insidePresented: [                                 │
│         File { name: "proof1.pdf", size: 512345 },      │
│         File { name: "proof2.pdf", size: 678901 }       │
│       ],                                                 │
│       outsidePresented: []                               │
│     }                                                    │
│   }                                                      │
│ }                                                        │
└───────────────────────────────────────────────────────────┘
                                      ↓
EVENT 5: UI Re-render
┌───────────────────────────────────────────────────────────┐
│ React detects state change                               │
│ Component re-renders with new file list:                 │
│                                                           │
│ ╔═══════════════════════════════════════╗              │
│ ║  + Click to Upload                    ║              │
│ ║                                       ║              │
│ ║  ✓ 2 files ready                      ║              │
│ ║                                       ║              │
│ ║  ┌──────────────────────────────────┐ ║              │
│ ║  │ 📄 proof1.pdf        [×]         │ ║              │
│ ║  │ 📄 proof2.pdf        [×]         │ ║              │
│ ║  └──────────────────────────────────┘ ║              │
│ ║                                       ║              │
│ ║  [Clear All Files]                    ║              │
│ ╚═══════════════════════════════════════╝              │
│                                                           │
│ Summary section also shows:                              │
│ Inside Presented: 2 file(s)                              │
│ └─ proof1.pdf                                            │
│ └─ proof2.pdf                                            │
└───────────────────────────────────────────────────────────┘
                                      ↓
EVENT 6: Additional File Operations (Optional)
┌───────────────────────────────────────────────────────────┐
│ User can:                                                 │
│ A) Click × to remove individual file                     │
│ B) Click "Clear All Files" to remove all                │
│ C) Click "+ Click to Upload" again to add more           │
│    → Files append (not replace)                          │
└───────────────────────────────────────────────────────────┘
```

---

## Form Submission Data Flow

```
USER CLICKS "SUBMIT EVENT" BUTTON
         │
         ↓
submitEventData(eventKey, eventTitle)
         │
         ├─ VALIDATION 1: Check mentor email exists
         │  └─ If empty → Alert & return
         │
         ├─ VALIDATION 2: Check files exist
         │  └─ If none → Alert & return
         │
         ↓
CREATE FormData Object
         │
         ├─ Append: studentInfo (JSON)
         ├─ Append: eventKey
         ├─ Append: eventTitle
         ├─ Append: mentorEmail
         ├─ Append: email
         ├─ Append: eventData (JSON - counts & marks)
         │
         └─ Loop through all files:
            ├─ For each category with files
            │  └─ For each file in category
            │     └─ Append: proofs[eventKey][categoryKey] = File
            │
            └─ Example:
               ├─ proofs[paperPresentation][insidePresented] = File1
               ├─ proofs[paperPresentation][insidePresented] = File2
               ├─ proofs[paperPresentation][outsidePresented] = File3
         │
         ↓
POST to Backend
         │
         ├─ URL: http://localhost:8080/api/sap/submit-individual-event
         ├─ Method: POST
         ├─ Body: FormData (multipart/form-data auto-set)
         │
         ↓
Set Status: "submitting"
Update UI: Button shows "Submitting..."
         │
         ↓
WAIT for Response
         │
         ├─ Success (res.ok === true)
         │  │
         │  ├─ Set Status: "success"
         │  ├─ Show Alert: "✅ ... submitted with X file(s)!"
         │  ├─ Clear files from state
         │  └─ Button shows "Submitted ✅" (disabled)
         │
         └─ Error
            │
            ├─ Set Status: "error"
            ├─ Show Alert: "❌ Error: {details}"
            └─ Button shows normal state (enable retry)
```

---

## Backend Processing Pipeline

```
REQUEST ARRIVES at /api/sap/submit-individual-event
                    │
                    ↓
        ┌──────────────────────┐
        │  MULTER MIDDLEWARE   │
        │  (upload.any())      │
        └──────────────────────┘
                    │
         (Multipart parser)
                    │
         ┌─ Parse form fields (studentInfo, eventKey, etc.)
         │
         └─ Parse files:
            ├─ Check file size (max 10MB each)
            ├─ Upload to Cloudinary
            ├─ Get URLs back
            └─ Create req.files array
                    │
                    ↓
        ┌──────────────────────────────┐
        │  CONTROLLER FUNCTION         │
        │  submitIndividualEvent()     │
        └──────────────────────────────┘
                    │
         ┌─ Extract data from request:
         │  ├─ studentInfo (parse JSON)
         │  ├─ eventKey, eventTitle
         │  ├─ eventData (parse JSON)
         │  └─ mentorEmail, email
         │
         ├─ Validate:
         │  └─ Check mentor email exists in database
         │
         ├─ Process files:
         │  ├─ req.files array contains:
         │  │  [
         │  │    { fieldname: "proofs[paperPresentation][insidePresented]",
         │  │      path: "https://cloudinary.com/file1" },
         │  │    { fieldname: "proofs[paperPresentation][insidePresented]",
         │  │      path: "https://cloudinary.com/file2" },
         │  │    { fieldname: "proofs[paperPresentation][outsidePresented]",
         │  │      path: "https://cloudinary.com/file3" }
         │  │  ]
         │  │
         │  └─ Parse fieldname using regex:
         │     proofs[([^\]]+)]\[([^\]]+)\]
         │     Extracts: eventKey, categoryKey
         │     Groups by categoryKey:
         │     {
         │       insidePresented: [url1, url2],
         │       outsidePresented: [url3]
         │     }
         │
         ├─ Create database object:
         │  {
         │    email, mentorEmail, name, activity,
         │    events: [{
         │      key, title,
         │      values: {
         │        counts, studentMarks, proofUrlsByCategory
         │      },
         │      status: "pending"
         │    }]
         │  }
         │
         ├─ Database operation:
         │  └─ Check if submission exists
         │     ├─ If yes: Update event in array
         │     └─ If no: Create new submission
         │
                    ↓
        ┌──────────────────────────────┐
        │  MongoDB Save Operation      │
        └──────────────────────────────┘
                    │
         └─ db.sapforms.updateOne() or insertOne()
                    │
                    ↓
        ┌──────────────────────────────┐
        │  Response to Frontend        │
        └──────────────────────────────┘
                    │
         └─ res.status(201).json({
              message: "Event submitted successfully",
              id: submission._id
            })
```

---

## State Management Diagram

```
Initial State:
┌──────────────────────────────────────────────────────────┐
│ eventData = {                                            │
│   paperPresentation: {                                  │
│     counts: {},           ← Input counts                 │
│     studentMarks: {},     ← Input marks                  │
│     files: {}             ← Upload files HERE            │
│   },                                                    │
│   projectPresentation: {...},                           │
│   ...                                                   │
│ }                                                       │
└──────────────────────────────────────────────────────────┘

After User Selects Files:
┌──────────────────────────────────────────────────────────┐
│ eventData = {                                            │
│   paperPresentation: {                                  │
│     counts: {                                           │
│       insidePresented: 5,                               │
│       outsidePresented: 2,                              │
│       premierPresented: 0                               │
│     },                                                  │
│     studentMarks: {                                     │
│       insidePresented: 10,                              │
│       outsidePresented: 4,                              │
│       premierPresented: 0                               │
│     },                                                  │
│     files: {                                            │
│       insidePresented: [                                │
│         File { name: "proof1.pdf", ... },              │
│         File { name: "proof2.jpg", ... }               │
│       ],                                                │
│       outsidePresented: [                               │
│         File { name: "outside.pdf", ... }              │
│       ],                                                │
│       premierPresented: []                              │
│     }                                                   │
│   },                                                    │
│   ...                                                   │
│ }                                                       │
└──────────────────────────────────────────────────────────┘

After Successful Submission:
┌──────────────────────────────────────────────────────────┐
│ eventData = {                                            │
│   paperPresentation: {                                  │
│     counts: {insidePresented: 5, ...},                  │
│     studentMarks: {insidePresented: 10, ...},           │
│     files: {                                            │
│       insidePresented: [],  ← CLEARED                   │
│       outsidePresented: [], ← CLEARED                   │
│       premierPresented: []  ← CLEARED                   │
│     }                                                   │
│   },                                                    │
│   ...                                                   │
│ }                                                       │
│                                                         │
│ submissionStatus = {                                    │
│   paperPresentation: "success"  ← Status tracked        │
│ }                                                       │
└──────────────────────────────────────────────────────────┘
```

---

## File Category Mapping Example

```
Event: "1. Paper Presentation"

User uploads:
├─ Inside Presented column:     file1.pdf, file2.jpg
├─ Outside Presented column:    file3.pdf
├─ Premier Presented column:    (empty)
├─ Inside Prize column:         file4.docx
├─ Outside Prize column:        file5.png
└─ Premier Prize column:        (empty)

State becomes:
┌─────────────────────────────────────────────────────┐
│ files: {                                            │
│   insidePresented:   [file1, file2],    ✓ 2 files  │
│   outsidePresented:  [file3],           ✓ 1 file   │
│   premierPresented:  [],                ✗ 0 files  │
│   insidePrize:       [file4],           ✓ 1 file   │
│   outsidePrize:      [file5],           ✓ 1 file   │
│   premierPrize:      []                 ✗ 0 files  │
│ }                                                   │
│ Total: 5 files ready for submission                │
└─────────────────────────────────────────────────────┘

FormData sent to backend:
proofs[paperPresentation][insidePresented] = file1
proofs[paperPresentation][insidePresented] = file2
proofs[paperPresentation][outsidePresented] = file3
proofs[paperPresentation][insidePrize] = file4
proofs[paperPresentation][outsidePrize] = file5

Backend processes:
proofUrlsByCategory = {
  insidePresented: ["url1", "url2"],
  outsidePresented: ["url3"],
  premierPresented: [],
  insidePrize: ["url4"],
  outsidePrize: ["url5"],
  premierPrize: []
}

Database stores:
values: {
  counts: {...},
  studentMarks: {...},
  proofUrlsByCategory: {...}  ← Files organized by category
}
```

---

## Error Handling Flow

```
USER ATTEMPTS TO SUBMIT

Check 1: Mentor Email
├─ Is mentorEmail empty?
│  ├─ YES → Alert: "❌ Please enter mentor email first"
│  │        Stop, return
│  └─ NO → Continue
         ↓
Check 2: Files Present
├─ Are there any files?
│  ├─ NO → Alert: "❌ Please upload at least one file"
│  │       Stop, return
│  └─ YES → Continue
         ↓
Check 3: FormData Creation
├─ Can FormData be created?
│  ├─ NO → Console error, continue anyway
│  └─ YES → Continue
         ↓
Check 4: Network Request
├─ Can request reach backend?
│  ├─ TIMEOUT/ERROR → Catch block
│  │                 Alert: "❌ Network error..."
│  │                 Status: "error"
│  │                 Return
│  └─ SUCCESS → Continue
         ↓
Check 5: Server Validation
├─ res.ok === true?
│  ├─ NO → Alert: "❌ Submission failed: {error}"
│  │       Status: "error"
│  │       Return
│  └─ YES → Continue
         ↓
SUCCESS!
├─ Alert: "✅ ... submitted with X file(s)!"
├─ Status: "success"
├─ Clear files
└─ Button: "Submitted ✅" (disabled)
```

---

## Console Logging Debug Info

```
Successful Submission:
┌─────────────────────────────────────────────────────────┐
│ Console Output:                                        │
│                                                        │
│ 📤 Submitting 5 files for 1. Paper Presentation       │
│ (Shows before fetch)                                  │
│                                                        │
│ Network tab shows:                                     │
│ POST /api/sap/submit-individual-event                 │
│ Status: 201 Created                                    │
│ Response: {message: "Event submitted...", id: "..."}  │
└─────────────────────────────────────────────────────────┘

Failed Submission:
┌─────────────────────────────────────────────────────────┐
│ Console Output:                                        │
│                                                        │
│ 📤 Submitting 3 files for 1. Paper Presentation       │
│ ❌ Submission error: TypeError: fetch failed           │
│ (Error logged in catch block)                          │
│                                                        │
│ Network tab shows:                                     │
│ POST /api/sap/submit-individual-event                 │
│ Status: 500 Internal Server Error                      │
│ OR: No response (server down)                          │
└─────────────────────────────────────────────────────────┘
```

