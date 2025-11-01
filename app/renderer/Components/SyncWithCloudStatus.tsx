import {useSupabaseSettings} from "@/renderer/Store/Supabase";

export default function SyncWithCloudStatus() {
    const supabaseSettingsState = useSupabaseSettings((state) => state.state);

    if (supabaseSettingsState !== 'unauthenticated') {
        return <></>
    }

    return <div>
        NOTE: Enable sync with cloud in settings.
    </div>
}
