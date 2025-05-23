export const getStatusColor = (available: number, total: number) => {
	if (available === 0) return "bg-red-100 text-red-800";
	if (available < total * 0.2) return "bg-yellow-100 text-yellow-800";
	return "bg-green-100 text-green-800";
};

export const getStatusText = (available: number, total: number) => {
	if (available === 0) return "Depleted";
	if (available < total * 0.2) return "Low Stock";
	return "In Stock";
};