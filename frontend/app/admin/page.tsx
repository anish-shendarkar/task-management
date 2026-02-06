"use client";

import { useEffect, useState } from "react";
import SummaryCard from "@/components/SummaryCard";
import Badge from "@/components/Badge"
import TaskCard from "@/components/TaskCard";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create task fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");

    // Edit Mode State
    const [editingTask, setEditingTask] = useState<any>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editAssignedTo, setEditAssignedTo] = useState("");
    const [editStatus, setEditStatus] = useState("");

    // Fetch users + tasks
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem("token");

        try {
            // Fetch users
            const usersRes = await fetch("http://localhost:3333/api/v1/admin/allusers", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const usersData = await usersRes.json();
            setUsers(usersData);

            // Fetch tasks
            const tasksRes = await fetch("http://localhost:3333/api/v1/admin/tasks", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const tasksData = await tasksRes.json();
            setTasks(tasksData);

            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Failed to load dashboard");
            setLoading(false);
        }
    };

    // Create a new task
    const createTask = async () => {
        if (!title || !assignedTo) return alert("Title and Assigned User required");

        const token = localStorage.getItem("token");

        try {
            await fetch(`http://localhost:3333/api/v1/admin/task/assign/${assignedTo}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description }),
            });

            setTitle("");
            setDescription("");
            setAssignedTo("");

            await fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to create task");
        }
    };

    // Delete a task
    const deleteTask = async (taskId: string) => {
        const token = localStorage.getItem("token");
        if (!confirm("Delete this task?")) return;

        try {
            await fetch(`http://localhost:3333/api/v1/admin/task/${taskId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete task");
        }
    };

    // Update task
    const updateTask = async () => {
        if (!editingTask) return;

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                `http://localhost:3333/api/v1/admin/task/${editingTask._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: editTitle,
                        description: editDescription,
                        assignedTo: editAssignedTo,
                        status: editStatus,
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to update task");

            setEditingTask(null);
            await fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to update task");
        }
    };

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Loading...
            </div>
        );
    }

    // Task counts per user (for user list)
    const usersWithCounts = users.map((user: any) => {
        const userTasks = tasks.filter(
            (task: any) => task.assignedTo?._id === user._id
        );
        return {
            ...user,
            pending: userTasks.filter((t: any) => t.status === "pending").length,
            in_progress: userTasks.filter((t: any) => t.status === "in_progress")
                .length,
            done: userTasks.filter((t: any) => t.status === "done").length,
        };
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-8">Welcome, Admin</p>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard label="Total Users" count={users.length} color="blue" />
                <SummaryCard label="Total Tasks" count={tasks.length} color="green" />
                <SummaryCard
                    label="Completed Tasks"
                    count={tasks.filter((t: any) => t.status === "done").length}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* USERS PANEL */}
                <div className="bg-white shadow p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-1">Users</h2>
                    <p className="text-gray-500 mb-4">Total users: {users.length}</p>

                    <div className="space-y-4">
                        {usersWithCounts.map((user: any) => (
                            <div key={user._id} className="border rounded-lg p-4">
                                <h3 className="font-medium">{user.name}</h3>
                                <p className="text-gray-500 text-sm">{user.email}</p>

                                <div className="flex gap-3 mt-3 text-xs">
                                    <Badge label={`${user.pending} pending`} color="blue" />
                                    <Badge
                                        label={`${user.in_progress} progress`}
                                        color="yellow"
                                    />
                                    <Badge label={`${user.done} done`} color="green" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TASKS PANEL */}
                <div className="md:col-span-2 bg-white shadow p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-6">Tasks</h2>

                    <div className="space-y-4">
                        {tasks.length > 0 ? (
                            tasks.map((task: any) => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    users={users}
                                    setEditingTask={setEditingTask}
                                    setEditTitle={setEditTitle}
                                    setEditDescription={setEditDescription}
                                    setEditAssignedTo={setEditAssignedTo}
                                    setEditStatus={setEditStatus}
                                    deleteTask={deleteTask}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">
                                No tasks created yet
                            </p>
                        )}
                    </div>

                    {editingTask && (
                        <div className="mt-8 mb-8 p-6 border rounded-xl bg-gray-100">
                            <h3 className="font-semibold mb-4 text-lg">Edit Task</h3>

                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <input
                                    type="text"
                                    className="border p-2 rounded"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />

                                <textarea
                                    className="border p-2 rounded h-24"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                />

                                <select
                                    className="border p-2 rounded"
                                    value={editAssignedTo}
                                    onChange={(e) => setEditAssignedTo(e.target.value)}
                                >
                                    <option value="">Assign to user</option>
                                    {users.map((user: any) => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="border p-2 rounded"
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={updateTask}
                                    className="px-4 py-2 bg-black text-white rounded"
                                >
                                    Save Changes
                                </button>

                                <button
                                    onClick={() => setEditingTask(null)}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CREATE NEW TASK */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="font-semibold mb-4 text-lg">Assign New Task</h3>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Task Title"
                                className="border p-2 rounded"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <textarea
                                placeholder="Task Description"
                                className="border p-2 rounded h-24"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            <select
                                className="border p-2 rounded"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                            >
                                <option value="">Assign to user</option>
                                {users.map((user: any) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={createTask}
                            className="px-4 py-2 bg-black text-white rounded"
                        >
                            Create Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
