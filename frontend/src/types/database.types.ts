export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			attribute_definitions: {
				Row: {
					category_id: string;
					created_at: string;
					description: string | null;
					id: string;
					is_active: boolean;
					is_required: boolean;
					key: string;
					name: string;
					options: Json | null;
					type: Database["public"]["Enums"]["attribute_type"];
					updated_at: string | null;
				};
				Insert: {
					category_id: string;
					created_at?: string;
					description?: string | null;
					id?: string;
					is_active?: boolean;
					is_required?: boolean;
					key: string;
					name: string;
					options?: Json | null;
					type: Database["public"]["Enums"]["attribute_type"];
					updated_at?: string | null;
				};
				Update: {
					category_id?: string;
					created_at?: string;
					description?: string | null;
					id?: string;
					is_active?: boolean;
					is_required?: boolean;
					key?: string;
					name?: string;
					options?: Json | null;
					type?: Database["public"]["Enums"]["attribute_type"];
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "attribute_definitions_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "batch_attributes";
						referencedColumns: ["category_id"];
					},
					{
						foreignKeyName: "attribute_definitions_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "categories";
						referencedColumns: ["id"];
					}
				];
			};
			attribute_values: {
				Row: {
					attribute_id: string;
					created_at: string;
					entity_id: string;
					entity_type: string;
					id: string;
					updated_at: string | null;
					value: string | null;
				};
				Insert: {
					attribute_id: string;
					created_at?: string;
					entity_id: string;
					entity_type: string;
					id?: string;
					updated_at?: string | null;
					value?: string | null;
				};
				Update: {
					attribute_id?: string;
					created_at?: string;
					entity_id?: string;
					entity_type?: string;
					id?: string;
					updated_at?: string | null;
					value?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "attribute_values_attribute_id_fkey";
						columns: ["attribute_id"];
						isOneToOne: false;
						referencedRelation: "attribute_definitions";
						referencedColumns: ["id"];
					}
				];
			};
			batch_items: {
				Row: {
					batch_id: string;
					created_at: string;
					id: string;
					location_id: string;
					notes: string | null;
					serial_number: string | null;
					sku: string;
					status: string;
					updated_at: string | null;
				};
				Insert: {
					batch_id: string;
					created_at?: string;
					id?: string;
					location_id: string;
					notes?: string | null;
					serial_number?: string | null;
					sku: string;
					status?: string;
					updated_at?: string | null;
				};
				Update: {
					batch_id?: string;
					created_at?: string;
					id?: string;
					location_id?: string;
					notes?: string | null;
					serial_number?: string | null;
					sku?: string;
					status?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "product_items_location_id_fkey";
						columns: ["location_id"];
						isOneToOne: false;
						referencedRelation: "locations";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "product_items_product_id_fkey";
						columns: ["batch_id"];
						isOneToOne: false;
						referencedRelation: "batch_attributes";
						referencedColumns: ["batch_id"];
					},
					{
						foreignKeyName: "product_items_product_id_fkey";
						columns: ["batch_id"];
						isOneToOne: false;
						referencedRelation: "batch_inventory";
						referencedColumns: ["batch_id"];
					},
					{
						foreignKeyName: "product_items_product_id_fkey";
						columns: ["batch_id"];
						isOneToOne: false;
						referencedRelation: "batches";
						referencedColumns: ["id"];
					}
				];
			};
			batches: {
				Row: {
					category_id: string;
					created_at: string;
					created_by: string | null;
					description: string | null;
					id: string;
					is_active: boolean | null;
					min_stock: number;
					name: string;
					price: number | null;
					sku: string | null;
					updated_at: string | null;
				};
				Insert: {
					category_id: string;
					created_at?: string;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					min_stock?: number;
					name: string;
					price?: number | null;
					sku?: string | null;
					updated_at?: string | null;
				};
				Update: {
					category_id?: string;
					created_at?: string;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					min_stock?: number;
					name?: string;
					price?: number | null;
					sku?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "products_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "batch_attributes";
						referencedColumns: ["category_id"];
					},
					{
						foreignKeyName: "products_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "categories";
						referencedColumns: ["id"];
					}
				];
			};
			categories: {
				Row: {
					attributes: string[] | null;
					created_at: string;
					created_by: string | null;
					description: string | null;
					id: string;
					is_active: boolean | null;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					attributes?: string[] | null;
					created_at?: string;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					attributes?: string[] | null;
					created_at?: string;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			inventory_movements: {
				Row: {
					batch_id: string;
					created_at: string;
					id: string;
					location: string;
					notes: string | null;
					quantity: number;
					reference: string;
					type: string;
					username: string | null;
				};
				Insert: {
					batch_id: string;
					created_at?: string;
					id?: string;
					location: string;
					notes?: string | null;
					quantity: number;
					reference: string;
					type: string;
					username?: string | null;
				};
				Update: {
					batch_id?: string;
					created_at?: string;
					id?: string;
					location?: string;
					notes?: string | null;
					quantity?: number;
					reference?: string;
					type?: string;
					username?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "inventory_movements_product_id_fkey";
						columns: ["batch_id"];
						isOneToOne: false;
						referencedRelation: "batch_attributes";
						referencedColumns: ["batch_id"];
					},
					{
						foreignKeyName: "inventory_movements_product_id_fkey";
						columns: ["batch_id"];
						isOneToOne: false;
						referencedRelation: "batch_inventory";
						referencedColumns: ["batch_id"];
					},
					{
						foreignKeyName: "inventory_movements_product_id_fkey";
						columns: ["batch_id"];
						isOneToOne: false;
						referencedRelation: "batches";
						referencedColumns: ["id"];
					}
				];
			};
			locations: {
				Row: {
					capacity: string | null;
					capacity_unit: string | null;
					created_at: string;
					description: string | null;
					id: string;
					is_active: boolean | null;
					name: string;
					parent_id: string | null;
					updated_at: string | null;
				};
				Insert: {
					capacity?: string | null;
					capacity_unit?: string | null;
					created_at?: string;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name: string;
					parent_id?: string | null;
					updated_at?: string | null;
				};
				Update: {
					capacity?: string | null;
					capacity_unit?: string | null;
					created_at?: string;
					description?: string | null;
					id?: string;
					is_active?: boolean | null;
					name?: string;
					parent_id?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "locations_parent_id_fkey";
						columns: ["parent_id"];
						isOneToOne: false;
						referencedRelation: "locations";
						referencedColumns: ["id"];
					}
				];
			};
			profiles: {
				Row: {
					created_at: string;
					display_name: string | null;
					email: string | null;
					id: string;
					role: 'manager' | 'admin' | 'auditor' | 'user' | 'visitor';
				};
				Insert: {
					created_at?: string;
					display_name?: string | null;
					email?: string | null;
					id?: string;
					role?: 'manager' | 'admin' | 'auditor' | 'user' | 'visitor';
				};
				Update: {
					created_at?: string;
					display_name?: string | null;
					email?: string | null;
					id?: string;
					role?: 'manager' | 'admin' | 'auditor' | 'user' | 'visitor';
				};
				Relationships: [];
			};
			invites: {
				Row: {
					id: string;
					email: string;
					role: 'manager' | 'admin' | 'auditor' | 'user' | 'visitor';
					invite_token: string;
					invited_by: string;
					created_at: string;
					expires_at: string;
					status: 'pending' | 'accepted' | 'expired';
				};
				Insert: {
					id?: string;
					email: string;
					role: 'manager' | 'admin' | 'auditor' | 'user' | 'visitor';
					invite_token: string;
					invited_by: string;
					created_at?: string;
					expires_at: string;
					status?: 'pending' | 'accepted' | 'expired';
				};
				Update: {
					id?: string;
					email?: string;
					role?: 'manager' | 'admin' | 'auditor' | 'user' | 'visitor';
					invite_token?: string;
					invited_by?: string;
					created_at?: string;
					expires_at?: string;
					status?: 'pending' | 'accepted' | 'expired';
				};
				Relationships: [
					{
						foreignKeyName: "invites_invited_by_fkey";
						columns: ["invited_by"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					}
				];
			};
		};
		Views: {
			batch_attributes: {
				Row: {
					attributes: Json | null;
					batch_id: string | null;
					batch_name: string | null;
					category_id: string | null;
					category_name: string | null;
				};
				Relationships: [];
			};
			batch_inventory: {
				Row: {
					batch_id: string | null;
					batch_name: string | null;
					category_id: string | null;
					location_id: string | null;
					location_name: string | null;
					quantity: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "product_items_location_id_fkey";
						columns: ["location_id"];
						isOneToOne: false;
						referencedRelation: "locations";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "products_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "batch_attributes";
						referencedColumns: ["category_id"];
					},
					{
						foreignKeyName: "products_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "categories";
						referencedColumns: ["id"];
					}
				];
			};
		};
		Functions: {
			get_batch_stock_by_location: {
				Args: { p_batch_id: string; p_location_id: string };
				Returns: number;
			};
			get_batch_total_stock: {
				Args: { p_batch_id: string };
				Returns: number;
			};
			get_entity_attributes: {
				Args: { p_entity_id: string; p_entity_type: string };
				Returns: {
					attribute_name: string;
					attribute_key: string;
					attribute_type: Database["public"]["Enums"]["attribute_type"];
					attribute_value: string;
				}[];
			};
			get_product_stock_by_location: {
				Args: { p_product_id: string; p_location_id: string };
				Returns: number;
			};
			get_product_total_stock: {
				Args: { p_product_id: string };
				Returns: number;
			};
			migrate_batch_attributes: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			update_batch_stock: {
				Args: { p_batch_id: string; p_quantity: number };
				Returns: undefined;
			};
			update_product_stock: {
				Args: { p_product_id: string; p_quantity: number };
				Returns: undefined;
			};
		};
		Enums: {
			attribute_type: "text" | "number" | "boolean" | "date" | "select";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
			DefaultSchema["Views"])
	? (DefaultSchema["Tables"] &
			DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
	? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
	? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;

export const Constants = {
	public: {
		Enums: {
			attribute_type: ["text", "number", "boolean", "date", "select"],
		},
	},
} as const;
