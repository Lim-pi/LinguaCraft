import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WordGenerator from "@/pages/word-generator";
import SoundChanges from "@/pages/sound-changes";
import Lexicon from "@/pages/lexicon";
import { useEffect } from "react";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/word-generator" component={WordGenerator} />
          <Route path="/sound-changes" component={SoundChanges} />
          <Route path="/lexicon" component={Lexicon} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const doc = document.firstElementChild;
    if (doc) {
      let theme: string;
      try {
        theme = localStorage.getItem("theme") || "system";
      } catch (e) {
        theme = "system";
      }
      doc.setAttribute("data-theme", theme);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;