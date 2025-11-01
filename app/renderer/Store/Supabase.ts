import {Database} from "@/database.types";
import {createClient} from '@supabase/supabase-js'
import {create} from "zustand/react";

const supabase = createClient<Database>(
    // @ts-expect-error
    import.meta.env.VITE_SUPABASE_URL,
    // @ts-expect-error
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

export async function supabaseCheckState() {
    const response = await supabase.auth.getUser()
    if (!response.data.user?.id) {
        useSupabaseSettings.setState({state: 'unauthenticated'});
        // setUserState({...userState, authenticated: false})
    } else {
        useSupabaseSettings.setState({state: 'enabled'});
        console.log("user.id", response.data.user.id)
        // setUserState({...userState, authenticated: true, user: response.data.user})
    }
    useSupabaseSettings.setState({user: response.data.user});
    console.log("supabaseSettings=", useSupabaseSettings.getState())

    return useSupabaseSettings.getState().state;
}

export async function supabaseSignInWithPassword(email: string, pass: string) {
    const response = await supabase.auth.signInWithPassword({
        email,
        password: pass,
    })
    console.log("supabaseAuthenticate response", response)
    if (response.error) {
        alert(response.error.message)
        return false;
    }

    return await supabaseCheckState();
}

export async function supabaseSignOut() {
    const response = await supabase.auth.signOut()
    console.log("supabaseAuthenticate response", response)
    if (response.error) {
        alert(response.error.message)
        return null;
    }

    return await supabaseCheckState();
}

interface SupabaseSettings {
    state: 'initializing' | 'enabled' | 'unauthenticated';
    user: any;
}

export const useSupabaseSettings = create<SupabaseSettings>((set) => ({
    state: 'initializing' as 'initializing' | 'enabled' | 'unauthenticated',
    user: null,
}));

export default supabase;
