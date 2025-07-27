import { useRef, useState, useEffect } from "react";
import { Note } from "../types/WanTypes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { SaveButton } from "./buttons";
import { writeFile, exists, mkdir, readFile } from "@tauri-apps/plugin-fs";
import { join, dirname } from "@tauri-apps/api/path";
import Popup from "./Popup";
import { AnimationType } from "./Popup";

const ATTACHMENTS_DIR = "attachments";

type Props = {
  note: Note;
  content: string;
  setContent: (val: string) => void;
  onSave: (updatedNote: Note) => void;
  title: string;
  setTitle: (val: string) => void;
  projectPath: string; // Path to the project directory
};

function NoteLayout({
  note,
  content,
  setContent,
  onSave,
  title,
  setTitle,
  projectPath, // Path to the project directory
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());
  const [popupProps, setPopupProps] = useState<{
    name?: string;
    title?: string;
    content: string;
    closePopup: () => void;
    width?: string;
    height?: string;
    showCloseButton?: boolean;
    animationType: AnimationType;
  animationDuration?: number;
  } | null>(null);


  const insertTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const before = content.substring(0, selectionStart);
      const after = content.substring(selectionEnd);
      const updatedContent = `${before}  ${after}`;
      setContent(updatedContent);

      setTimeout(() => {
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd =
          selectionStart + 2;
      }, 0);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        const arrayBuffer = await blob?.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer || []);
        const fileName = `image-${Date.now()}.png`;

        // Extract the directory from the .wan file
        const projectDir = await dirname(projectPath);
        const attachmentsPath = await join(projectDir, ATTACHMENTS_DIR);
        const filePath = await join(attachmentsPath, fileName);

        // Check if the directory exists and create it if it doesn't
        const existsDir = await exists(attachmentsPath);
        if (!existsDir) {
          await mkdir(attachmentsPath, { recursive: true });
        }

        // Save the image file in the attachments directory
        await writeFile(filePath, bytes);

        console.log(`Image saved as: ${fileName} at: ${attachmentsPath}`);

        // Insert image markdown
        const md = `![${fileName}](./attachments/${fileName})`;
        await insertImage(md);
      }
    }
  };

  const insertImage = async (md: string) => {
    const textarea = textAreaRef.current;
    const start = textarea?.selectionStart || 0;
    const end = textarea?.selectionEnd || 0;

    const before = content.substring(0, start);
    const after = content.substring(end);
    const updatedContent = `${before}${md}${after}`;

    setContent(updatedContent);
  };

  const handleSave = () => {
    const updatedNote: Note = {
      ...note,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };
    setPopupProps({
      name: "SuccessPopup",
      title: "Note Saved",
      content: `Note "${title}" has been saved successfully.`,
      closePopup: () => setPopupProps(null),
      animationType: AnimationType.FADE,
      animationDuration: 5000,
    });
    onSave(updatedNote);
  };



  const handleTitleClick = () => setIsEditingTitle(true);

  const handleTitleBlur = () => {
    if (title.trim() === "") {
      setTitle("Untitled Note");
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="note-layout bg-base-300 my-6 w-full p-4 h-full flex flex-col items-center justify-between">
      <header className="note-header mb-2 container">
        {isEditingTitle ? (
          <input
            type="text"
            className="text-xl font-semibold bg-transparent border-b border-gray-500 focus:outline-none w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h2
            className="text-xl font-semibold cursor-pointer"
            onClick={handleTitleClick}
            title="Click to edit title"
          >
            {title}
          </h2>
        )}
        <small className="block">
          Created at: {new Date(note.createdAt).toLocaleDateString()}
        </small>
        <small className="block">
          Last updated: {new Date(note.updatedAt).toLocaleDateString()}
        </small>
      </header>

      <section className="note-content flex flex-row items-start justify-between w-full flex-1 min-h-0">
        <textarea
          ref={textAreaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={insertTab}
          onPaste={handlePaste}
          className="w-1/2 h-full p-2 border border-gray-600 outline-none rounded bg-[#0f172a] text-white font-mono resize-none overflow-y-auto"
        />
        <div className="markdown-preview h-full w-1/2 p-4 border-l border-gray-700 prose prose-invert max-w-none overflow-y-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ node, ...props }) => {
                // If src starts with ./attachments/, convert to base64
                if (props.src?.startsWith('./attachments/')) {
                  const fileName = props.src.replace('./attachments/', '');
                  const cacheKey = fileName;

                  // Check if we already have the image in cache
                  if (imageCache.has(cacheKey)) {
                    return (
                      <img
                        {...props}
                        src={imageCache.get(cacheKey)}
                        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                      />
                    );
                  }

                  // Load image asynchronously
                  const loadImage = async () => {
                    try {
                      const projectDir = projectPath.substring(0, projectPath.lastIndexOf('/'));
                      const fullPath = `${projectDir}/${ATTACHMENTS_DIR}/${fileName}`;
                      
                      const imageBytes = await readFile(fullPath);
                      const base64 = btoa(String.fromCharCode(...imageBytes));
                      const dataUrl = `data:image/png;base64,${base64}`;
                      
                      // Actualizar cache
                      setImageCache(prev => new Map(prev).set(cacheKey, dataUrl));
                    } catch (error) {
                      console.error('Error loading image:', error);
                    }
                  };

                  loadImage();

                  // Placeholder while loading
                  return (
                    <div style={{ 
                      width: '100%', 
                      height: '100px', 
                      backgroundColor: '#333', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#666'
                    }}>
                      Loading image...
                    </div>
                  );
                }
                return <img {...props} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </section>

      <footer className="note-footer mt-2 self-center bottom-0">
        <SaveButton onClick={handleSave} label="Save Note" className="mt-2" />
      </footer>

      {popupProps && (
        <Popup
          {...popupProps}
        />
      )}
    </div>
  );
}

export default NoteLayout;