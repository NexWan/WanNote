/*

Button components for the application
Path: src/components/buttons.tsx

*/
import {PlusOutlined } from "@ant-design/icons";
import { CheckOutlined } from "@ant-design/icons";

type ButtonProps = {
    onClick: () => void;
    label: string;
    className?: string;
};

const NewButton: React.FC<ButtonProps> = ({ onClick, label, className }) => {
    return (
        <button
            onClick={onClick}
            className={`flex btn-circle flex-col items-center justify-center px-4 py-2 bg-primary hover:bg-accent hover:scale-105 transition-all ${className}`}
        >
            <PlusOutlined className="text-xl" />
            <p className="text-secondary-content">{label}</p>
        </button>
    );
};

const SaveButton: React.FC<ButtonProps> = ({ onClick, label, className }) => {
    return (
        <button
            onClick={onClick}
            className={`btn btn-primary ${className}`}
        >
            <CheckOutlined className="mr-2" />
            {label}
        </button>
    );
};

export { NewButton, SaveButton };