import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class KvStoreService {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
    }

    async set(key: string, value: any): Promise<void> {
        const { error } = await this.supabase
            .from('kv_store_0c50a72d')
            .upsert({ key, value });

        if (error) {
            throw new Error(error.message);
        }
    }

    async get(key: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('kv_store_0c50a72d')
            .select('value')
            .eq('key', key)
            .maybeSingle();

        if (error) {
            throw new Error(error.message);
        }

        return data?.value;
    }

    async del(key: string): Promise<void> {
        const { error } = await this.supabase
            .from('kv_store_0c50a72d')
            .delete()
            .eq('key', key);

        if (error) {
            throw new Error(error.message);
        }
    }

    async getByPrefix(prefix: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('kv_store_0c50a72d')
            .select('key, value')
            .like('key', prefix + '%');

        if (error) {
            throw new Error(error.message);
        }

        return data?.map((d) => d.value) ?? [];
    }
}