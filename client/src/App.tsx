import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFoundPage from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import HomePage from "@/pages/home";
import MoviesPage from "@/pages/movies";
import SeriesPage from "@/pages/series";
import SearchPage from "@/pages/search";
import ContentDetailPage from "@/pages/content-detail";
import { ProtectedRoute } from "@/components/protected-route";
import { useEffect, useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      </Route>
      <Route path="/movies">
        <ProtectedRoute>
          <MoviesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/series">
        <ProtectedRoute>
          <SeriesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/search">
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      </Route>
      <Route path="/content/:id">
        <ProtectedRoute>
          <ContentDetailPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Netflix-style streaming app should always be in dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;