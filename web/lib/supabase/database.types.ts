type CafeRow = {
	id: string;
	name: string;
	slug: string;
	is_active: boolean;
	accepting_orders: boolean;
	created_at: string;
};

export type OrderStatus = 'new' | 'in_progress' | 'ready' | 'closed' | 'cancelled';

type OrderRow = {
	id: string;
	cafe_id: string;
	order_number: string;
	type: 'dine_in' | 'pickup';
	table_label: string | null;
	customer_name: string | null;
	customer_phone: string | null;
	comment: string | null;
	status: OrderStatus;
	total_rub: number;
	created_at: string;
};

type OrderItemRow = {
	id: string;
	order_id: string;
	cafe_id: string;
	menu_item_id: string | null;
	name_snapshot: string;
	price_snapshot_rub: number;
	qty: number;
	created_at: string;
};

type ProfileRow = {
	user_id: string;
	role: 'platform_admin' | 'cafe_staff';
	cafe_id: string | null;
	created_at: string;
};

export type Database = {
	public: {
		Tables: {
			cafes: {
				Row: CafeRow;
				Insert: Partial<CafeRow> & Pick<CafeRow, 'name' | 'slug'>;
				Update: Partial<CafeRow>;
				Relationships: [];
			};
			orders: {
				Row: OrderRow;
				Insert: Omit<OrderRow, 'id'> & { id?: string };
				Update: Partial<OrderRow>;
				Relationships: [];
			};
			order_items: {
				Row: OrderItemRow;
				Insert: Omit<OrderItemRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
				Update: Partial<OrderItemRow>;
				Relationships: [];
			};
			profiles: {
				Row: ProfileRow;
				Insert: Omit<ProfileRow, 'created_at'> & { created_at?: string };
				Update: Partial<ProfileRow>;
				Relationships: [];
			};
		};
		Views: { [_ in never]: never };
		Functions: { [_ in never]: never };
		Enums: { [_ in never]: never };
		CompositeTypes: { [_ in never]: never };
	};
};
