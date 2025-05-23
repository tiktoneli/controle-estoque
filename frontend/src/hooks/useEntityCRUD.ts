import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";
import { PostgrestQueryBuilder } from "@supabase/postgrest-js";

type TableName = "batches" | "categories" | "locations" | "attribute_definitions" | "attribute_values" | "batch_items" | "batch_inventory" | "batch_items_view";

interface EntityCRUDOptions<T> {
	tableName: TableName;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	transformData?: (data: unknown) => T;
	validateData?: (data: Partial<T>) => boolean;
	validationMessage?: string;
}

export function useEntityCRUD<T>(options: EntityCRUDOptions<T>) {
	const { addToast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	const create = async (data: Partial<T>) => {
		try {
			setIsLoading(true);

			if (options.validateData && !options.validateData(data)) {
				addToast({
					title: "Validation Error",
					message:
						options.validationMessage || "Invalid data provided",
					type: "error",
				});
				return;
			}

			const { error } = await supabase
				.from(options.tableName)
				.insert([data]);

			if (error) throw error;

			addToast({
				title: "Success",
				message: "Item created successfully",
				type: "success",
			});

			options.onSuccess?.();
		} catch (error) {
			console.error(`Error creating ${options.tableName}:`, error);
			addToast({
				title: "Error",
				message: `Failed to create ${options.tableName}`,
				type: "error",
			});
			options.onError?.(error as Error);
		} finally {
			setIsLoading(false);
		}
	};

	const update = async (id: string, data: Partial<T>) => {
		try {
			setIsLoading(true);

			if (options.validateData && !options.validateData(data)) {
				addToast({
					title: "Validation Error",
					message:
						options.validationMessage || "Invalid data provided",
					type: "error",
				});
				return;
			}

			const { error } = await supabase
				.from(options.tableName)
				.update(data)
				.eq("id", id);

			if (error) throw error;

			addToast({
				title: "Success",
				message: "Item updated successfully",
				type: "success",
			});

			options.onSuccess?.();
		} catch (error) {
			console.error(`Error updating ${options.tableName}:`, error);
			addToast({
				title: "Error",
				message: `Failed to update ${options.tableName}`,
				type: "error",
			});
			options.onError?.(error as Error);
		} finally {
			setIsLoading(false);
		}
	};

	const remove = async (id: string) => {
		try {
			setIsLoading(true);

			const { error } = await supabase
				.from(options.tableName)
				.delete()
				.eq("id", id);

			if (error) throw error;

			addToast({
				title: "Success",
				message: "Item deleted successfully",
				type: "success",
			});

			options.onSuccess?.();
		} catch (error) {
			console.error(`Error deleting ${options.tableName}:`, error);
			addToast({
				title: "Error",
				message: `Failed to delete ${options.tableName}`,
				type: "error",
			});
			options.onError?.(error as Error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetch = async (query?: (q: PostgrestQueryBuilder<any, any, any>) => PostgrestQueryBuilder<any, any, any>) => {
		try {
			setIsLoading(true);
			let baseQuery = supabase.from(options.tableName).select("*");

			if (query) {
				baseQuery = query(baseQuery);
			}

			const { data, error } = await baseQuery;

			if (error) throw error;

			return options.transformData
				? data.map(options.transformData)
				: data;
		} catch (error) {
			console.error(`Error fetching ${options.tableName}:`, error);
			addToast({
				title: "Error",
				message: `Failed to fetch ${options.tableName}`,
				type: "error",
			});
			options.onError?.(error as Error);
			return [];
		} finally {
			setIsLoading(false);
		}
	};

	return {
		create,
		update,
		remove,
		fetch,
		isLoading,
	};
}
