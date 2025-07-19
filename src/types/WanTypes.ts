export type ProjectStructure = {
    name: string; // Name of the project
    description: string; // Description of the project
    createdAt: string; // ISO date string of when the project was created
    updatedAt: string; // ISO date string of when the project was last updated
    notes: Note[]; // Array of notes in the project
};

type Note = {
    id: string; // Unique identifier for the note
    title: string; // Title of the note
    content: string; // Content of the note (markdown or plain text)
    createdAt: string; // ISO date string of when the note was created
    updatedAt: string; // ISO date string of when the note was last updated
    tags?: string[]; // Optional array of tags associated with the note
    attachments?: Attachment[]; // Optional array of attachments associated with the note
};

type Attachment = {
    id: string; // Unique identifier for the attachment
    filename: string; // Name of the file
    filetype: string; // MIME type of the file
    filesize: number; // Size of the file in bytes
    createdAt: string; // ISO date string of when the attachment was created
    updatedAt: string; // ISO date string of when the attachment was last updated
};