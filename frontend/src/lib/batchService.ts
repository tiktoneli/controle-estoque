import { supabase } from './supabase';
import { Batch, ProductType, BatchFilters, BatchInventory } from '../types';

export const batchService = {
    async fetchBatches(filters: Partial<BatchFilters> = {}): Promise<(Batch & { types: ProductType })[]> {
        let query = supabase
            .from('batches')
            .select(`
                *,
                types:type_id (
                    id,
                    name
                )
            `);

        if (filters.typeId?.trim()) {
            query = query.eq('type_id', filters.typeId);
        }

        if (filters.search?.trim()) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as (Batch & { types: ProductType })[];
    },

    async fetchBatchInventory(): Promise<BatchInventory[]> {
        const { data, error } = await supabase
            .from('batch_inventory')
            .select('*');

        if (error) throw error;
        return data;
    },

    async fetchTypes(): Promise<ProductType[]> {
        const { data, error } = await supabase
            .from('types')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    async createBatch(batchData: Omit<Batch, 'id' | 'created_at' | 'created_by'>): Promise<Batch> {
        const { data, error } = await supabase
            .from('batches')
            .insert([{
                ...batchData,
                min_stock: batchData.min_stock || 0
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateBatch(id: string, batchData: Partial<Omit<Batch, 'id' | 'created_at' | 'created_by'>>): Promise<Batch> {
        const { data, error } = await supabase
            .from('batches')
            .update({
                ...batchData,
                min_stock: batchData.min_stock || 0
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteBatch(id: string): Promise<void> {
        const { error } = await supabase
            .from('batches')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};