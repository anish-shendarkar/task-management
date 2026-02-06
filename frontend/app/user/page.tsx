"use client";

import { useEffect, useState } from "react";

interface Task {
    _id: string;
    title: string;
    description: string;
    status: "pending" | "in_progress" | "done";
    assignedUser: string;
    createdAt: string;
    updatedAt: string;
}

export default function MyTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch logged-in user's tasks
    useEffect(() => {
        async function fetchTasks() {
            const token = localStorage.getItem("token");

            try {
                const res = await fetch("http://localhost:3333/user/tasks", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch tasks");
                }

                const data = await res.json();
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
                alert("Failed to load tasks");
            } finally {
                setLoading(false);
            }
        }
        fetchTasks();
    }, []);

    const updateStatus = async (taskId: string, newStatus: string) => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:3333/user/tasks/status/${taskId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            // Refresh tasks
            const updatedRes = await fetch("http://localhost:3333/user/tasks", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const updated = await updatedRes.json();
            setTasks(updated);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update task status");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Loading...
            </div>
        );
    }

    const summary = {
        pending: tasks.filter((t: any) => t.status === "pending").length,
        in_progress: tasks.filter((t: any) => t.status === "in_progress").length,
        done: tasks.filter((t: any) => t.status === "done").length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
            <p className="text-gray-600 mb-8">Welcome, User</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard label="Pending" count={summary.pending} color="blue" />
                <SummaryCard label="In Progress" count={summary.in_progress} color="yellow" />
                <SummaryCard label="Completed" count={summary.done} color="green" />
            </div>

            {/* Tasks List */}
            <div className="bg-white shadow p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-1">Your Tasks</h2>
                <p className="text-gray-500 mb-6">
                    Total tasks assigned: {tasks.length}
                </p>

                <div className="space-y-6">
                    {tasks.length > 0 ? (
                        tasks.map((task: any) => (
                            <TaskCard key={task._id} task={task} updateStatus={updateStatus} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">No tasks assigned yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, count, color }: { label: string; count: number; color: "blue" | "yellow" | "green" }) {
    const colors = {
        blue: "text-blue-600 bg-blue-100",
        yellow: "text-yellow-600 bg-yellow-100",
        green: "text-green-600 bg-green-100",
    };

    return (
        <div className="bg-white shadow rounded-xl p-6 flex justify-between items-center">
            <div>
                <p className="text-gray-600 font-medium">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{count}</p>
            </div>
        </div>
    );
}

function TaskCard({ task, updateStatus }: any) {
    const bg =
        task.status === "pending"
            ? "bg-blue-50 border-blue-200"
            : task.status === "in_progress"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200";

    const statusOptions = ["pending", "in_progress", "done"];

    return (
        <div className={`border rounded-xl p-5 ${bg}`}>
            <div className="flex justify-between">
                <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-gray-700 mt-1">{task.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                        {" • "}
                        Updated: {new Date(task.updatedAt).toLocaleDateString()}
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    <label className="text-sm text-gray-700 mb-1">Update Status</label>
                    <select
                        className="border rounded-lg px-3 py-1 bg-white"
                        value={task.status}
                        onChange={(e) => updateStatus(task._id, e.target.value)}
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt.replace("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}