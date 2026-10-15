// components/WakeOverlay.jsx
import { useState, useEffect } from "react";
import { subscribeWakeState } from "../apis";
import api from "../apis";
import logo from "../assets/logo.png";

export default function Wakeoverlay() {
    const [visible, setVisible] = useState(false);

    useEffect(() => subscribeWakeState(setVisible), []);

    // when overlay becomes visible, proactively call the backend wake endpoint
    useEffect(() => {
        if (!visible) return;
        let mounted = true;
        (async () => {
            try {
                await api.get('/campusconnect');
            } catch (err) {
                // ignore errors, the overlay will hide when other requests complete
            }
        })();
        return () => { mounted = false; };
    }, [visible]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 text-center">
            <img src={logo} alt="Campus Connect" className="h-14 mb-5" />
            <p className="text-gray-700 font-medium">Waking up the server…</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
                This takes about 30 seconds the first time. It won't happen again during your visit.
            </p>
            <div className="mt-6 w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-blue-700 rounded-full animate-pulse" />
            </div>
        </div>
    );
}