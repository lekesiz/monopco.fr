import { useState, useEffect } from "react";
import { Router, RouterProps } from "wouter";

// Returns the current hash location (minus the # symbol)
const currentLoc = () => window.location.hash.replace(/^#/, "") || "/";

export const useHashLocation = () => {
  const [loc, setLoc] = useState(currentLoc());

  useEffect(() => {
    const handler = () => setLoc(currentLoc());

    // Subscribe to hash changes
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return [loc, navigate] as const;
};

export const HashRouter = (props: RouterProps) => {
    const [location] = useHashLocation();
    return <Router hook={useHashLocation} {...props} />;
};