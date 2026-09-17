import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./lib/supabaseClient";
import Auth from "./Auth";
import App from "./App";
import "./index.css";

function Root() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="boot-loading">Loading…</div>;
  }
  if (!session) {
    return <Auth />;
  }
  return <App key={session.user.id} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
