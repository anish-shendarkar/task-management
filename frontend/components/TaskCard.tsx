export default function TaskCard({
    task,
    users,
    setEditingTask,
    setEditTitle,
    setEditDescription,
    setEditAssignedTo,
    setEditStatus,
    deleteTask,
}: any) {
    const bg =
        task.status === "pending"
            ? "bg-blue-50 border-blue-200"
            : task.status === "in_progress"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200";

    return (
        <div className={`border rounded-lg p-4 ${bg}`}>
            <div className="flex justify-between">
                <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                    <p className="mt-2 text-sm text-gray-700">
                        Assigned to:{" "}
                        <span className="font-medium">
                            {task.assignedTo?.name || "Unknown"}
                        </span>
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setEditingTask(task);
                            setEditTitle(task.title);
                            setEditDescription(task.description);
                            setEditAssignedTo(task.assignedTo?._id || "");
                            setEditStatus(task.status);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => deleteTask(task._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <span
                className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded ${task.status === "pending"
                        ? "bg-blue-200 text-blue-700"
                        : task.status === "in_progress"
                            ? "bg-yellow-200 text-yellow-700"
                            : "bg-green-200 text-green-700"
                    }`}
            >
                {task.status.replace("_", " ").toUpperCase()}
            </span>
        </div>
    );
}