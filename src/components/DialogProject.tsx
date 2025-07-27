import { ProjectStructure } from "../types/WanTypes";
import { useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { mkdir, writeTextFile } from "@tauri-apps/plugin-fs";

interface DialogProjectProps {
    onClose: () => void;
    onSave: (project: ProjectStructure) => void;
    initialProject?: Partial<ProjectStructure>;
    title?: string;
}

export default function DialogProject({ 
    onClose, 
    onSave, 
    initialProject,
    title = "Create New Project" 
}: DialogProjectProps) {
    const [projectName, setProjectName] = useState(initialProject?.name || "");
    const [projectDescription, setProjectDescription] = useState(initialProject?.description || "");
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [projectPath, setProjectPath] = useState(initialProject?.path || "");
    const [isCreating, setIsCreating] = useState(false);

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!projectName.trim()) {
            newErrors.name = "Project name is required";
        }
        
        if (projectName.length > 50) {
            newErrors.name = "Project name must be 50 characters or less";
        }

        if (!projectPath) {
            newErrors.path = "Please select a location to save the project";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSelectPath = async () => {
        try {
            const directoryPath = await open({
                directory: true,
                multiple: false
            });

            if (directoryPath) {
                setProjectPath(directoryPath as string);
                // Clear path error if it exists
                if (errors.path) {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.path;
                        return newErrors;
                    });
                }
            }
        } catch (error) {
            console.error("Error selecting directory:", error);
            setErrors(prev => ({ ...prev, path: "Failed to select directory" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsCreating(true);

        try {
            // Create project folder path
            const projectFolderPath = `${projectPath}/${projectName.trim()}`;
            const projectFilePath = `${projectFolderPath}/${projectName.trim()}.wan`;
            
            // Create the project folder
            await mkdir(projectFolderPath, { recursive: true });
            
            // Create the project structure
            const project: ProjectStructure = {
                name: projectName.trim(),
                description: projectDescription.trim(),
                path: projectFilePath,
                createdAt: initialProject?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                notes: initialProject?.notes || [],
            };

            // Write the project file to disk
            await writeTextFile(projectFilePath, JSON.stringify(project, null, 2));
            
            // Call the onSave callback with the created project
            onSave(project);
        } catch (error) {
            console.error("Error creating project:", error);
            setErrors(prev => ({ ...prev, general: "Failed to create project file" }));
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e as any);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
                className="bg-base-200 rounded-lg shadow-xl border border-gray-600 w-full max-w-md mx-4"
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-600">
                    <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full p-1 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* General Error */}
                    {errors.general && (
                        <div className="p-3 bg-red-900 border border-red-700 rounded-md">
                            <p className="text-red-200 text-sm">{errors.general}</p>
                        </div>
                    )}

                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder="Enter project name"
                            autoFocus
                            disabled={isCreating}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Project Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter project description (optional)"
                            rows={3}
                            disabled={isCreating}
                        />
                    </div>

                    {/* Project Path Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Parent Directory *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={projectPath}
                                readOnly
                                className={`flex-1 px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none ${
                                    errors.path ? 'border-red-500' : 'border-gray-600'
                                }`}
                                placeholder="Click 'Browse' to select parent directory"
                            />
                            <button
                                type="button"
                                onClick={handleSelectPath}
                                disabled={isCreating}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Browse
                            </button>
                        </div>
                        {errors.path && <p className="text-red-500 text-sm mt-1">{errors.path}</p>}
                        {projectPath && projectName && (
                            <p className="text-xs text-gray-400 mt-1">
                                Project will be created at: <span className="text-blue-400">{projectPath}/{projectName}/{projectName}.wan</span>
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            className="flex-1 px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isCreating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                "Create Project"
                            )}
                        </button>
                    </div>
                </form>

                {/* Keyboard Shortcuts Help */}
                <div className="px-4 pb-4">
                    <p className="text-xs text-gray-500">
                        Press <kbd className="bg-gray-700 px-1 rounded">Esc</kbd> to cancel, 
                        <kbd className="bg-gray-700 px-1 rounded">Ctrl+Enter</kbd> to save
                    </p>
                </div>
            </div>
        </div>
    );
}