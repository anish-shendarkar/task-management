export default function Badge({ label, color }: { label: string; color: 'blue' | 'yellow' | 'green' }) {
    const bg = {
        blue: "bg-blue-100 text-blue-600",
        yellow: "bg-yellow-100 text-yellow-600",
        green: "bg-green-100 text-green-600",
    };

    return (
        <span className={`px-2 py-1 rounded text-xs ${bg[color]}`}>{label}</span>
    );
}
