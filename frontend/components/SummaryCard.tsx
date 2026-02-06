export default function SummaryCard({ label, count, color }: any) {
    const colors: any = {
        blue: "text-blue-600",
        green: "text-green-600",
        purple: "text-purple-600",
    };

    return (
        <div className="bg-white shadow rounded-xl p-6">
            <p className="text-gray-600 font-medium">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{count}</p>
        </div>
    );
}