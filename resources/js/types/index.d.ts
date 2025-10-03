import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    permissions: string[];
}

export interface BreadcrumbItem {
    title: string | JSX.Element;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
    permission?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    eventSettings: {
        event_name: string;
        event_logo: string;
    };
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role_id?: number;
    role?: Role;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Role {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
    users?: User[];
}

export interface Permission {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    module: string;
    created_at: string;
    updated_at: string;
    roles?: Role[];
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface Ticket {
    id: number;
    name: string;
    description?: string;
    price: number;
    is_free: boolean;
    stock: number;
    sold: number;
    is_active: boolean;
    sale_start_date?: string;
    sale_end_date?: string;
    image?: string;
    created_at: string;
    updated_at: string;
    available_stock: number;
    is_on_sale: boolean;
    orders_count?: number;
    orders?: Order[];
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    nik?: string;
    ktp_image?: string;
    id_type: 'ktp' | 'sim' | 'passport';
    address?: string;
    full_address?: string;
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    birth_date?: string;
    place_of_birth?: string;
    gender?: 'male' | 'female';
    blood_type?: 'A' | 'B' | 'AB' | 'O';
    shirt_size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
    medical_conditions?: string;
    allergies?: string;
    has_insurance: boolean;
    insurance_name?: string;
    insurance_number?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    created_at: string;
    updated_at: string;
    formatted_name: string;
    age?: number;
    full_address_formatted: string;
    orders?: Order[];
}

export interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    ticket_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: 'pending' | 'paid' | 'cancelled' | 'expired';
    payment_method?: string;
    payment_reference?: string;
    paid_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    ticket?: Ticket;
    status_color: string;
}
