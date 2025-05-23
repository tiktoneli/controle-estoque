/**
 * Utility functions for generating batch codes
 */

import { supabase } from "../supabase";

/**
 * Generates a unique batch code based on the provided prefix and existing codes
 * Format: PREFIX-XXX where XXX is an incremental number
 * If no prefix is provided, uses XXX format
 * All prefixes are converted to uppercase to ensure consistency
 *
 * @param prefix Optional prefix for the batch code (default: 'BCH')
 * @returns A promise that resolves to a unique batch code
 */
export async function generateBatchCode(
	prefix: string = "BCH"
): Promise<string> {
	const baseCode = prefix ? prefix.toUpperCase() : '';

	// Get highest existing batch code with this prefix
	const { data } = await supabase
		.from("batches")
		.select("sku")
		.like("sku", `${baseCode}-%`)
		.order("sku", { ascending: false })
		.limit(1);

	// Determine next sequence number
	let nextSequence = 1;
	if (data && data.length > 0) {
		const lastCode = data[0].sku;
		const lastSequenceStr = lastCode.split("-").pop();
		if (lastSequenceStr && !isNaN(parseInt(lastSequenceStr))) {
			nextSequence = parseInt(lastSequenceStr) + 1;
		}
	}

	// Generate the new code with padding (e.g., 001, 012, 123)
	return `${baseCode}-${nextSequence.toString().padStart(3, "0")}`;
}

/**
 * Batch generates multiple unique batch codes
 *
 * @param count Number of batch codes to generate
 * @param prefix Optional prefix for the batch codes (default: 'BCH')
 * @returns A promise that resolves to an array of unique batch codes
 */
export async function generateMultipleBatchCodes(
	count: number,
	prefix: string = "BCH"
): Promise<string[]> {
	if (count <= 0) return [];

	// Get a base batch code first
	const baseCode = await generateBatchCode(prefix);
	if (!baseCode)
		return Array(count)
			.fill("")
			.map((_, i) => `${prefix ? prefix.toUpperCase() + '-' : ''}${i + 1}`);

	const parts = baseCode.split("-");
	const sequence = parseInt(parts[parts.length - 1] || "1");

	// Generate subsequent codes
	const codes: string[] = [baseCode];
	for (let i = 1; i < count; i++) {
		const nextSeq = sequence + i;
		codes.push(
			`${parts.slice(0, -1).join("-")}-${nextSeq.toString().padStart(3, "0")}`
		);
	}

	return codes;
}
