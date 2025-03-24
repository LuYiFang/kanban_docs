import React from "react";

const DocsPage: React.FC = () => {
    const documents = [
        { id: 1, name: "Project Plan.pdf", type: "PDF" },
        { id: 2, name: "Team Guidelines.docx", type: "Word" },
    ];

    return (
        <div className="p-4 bg-gray-900 text-gray-300">
            <h1 className="text-2xl font-bold mb-4">Documents</h1>
            <input
                type="text"
                placeholder="Search documents..."
                className="border p-2 mb-4 w-full"
            />
            <ul className="space-y-2">
                {documents.map((doc) => (
                    <li
                        key={doc.id}
                        className="p-2 border rounded bg-gray-100 hover:bg-gray-200"
                    >
                        {doc.name} ({doc.type})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DocsPage;