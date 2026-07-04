import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import AccessControl from "./pages/AccessControl";
import PropertyForm from "./pages/PropertyForm";
import PropertyDetails from "./pages/PropertyDetails";
import PublicPortal from "./pages/PublicPortal";
import ButtonShowcase from "./pages/ButtonShowcase";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import PropertyList from "./pages/PropertyList";
import RequireAuth from "./components/RequireAuth";

export const router = createBrowserRouter([
  {
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/public",
        element: <PublicPortal />,
      },
      {
        path: "/design/buttons",
        element: <ButtonShowcase />,
      },
      {
        path: "/",
        element: <RequireAuth><AppLayout /></RequireAuth>,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "analytics", element: <AnalyticsDashboard /> },
          { path: "properties", element: <PropertyList /> },
          { path: "admin/access", element: <RequireAuth allowedRoles={['Admin']}><AccessControl /></RequireAuth> },
          { path: "property/new", element: <RequireAuth allowedRoles={['Admin', 'Editor']}><PropertyForm /></RequireAuth> },
          { path: "property/:id/edit", element: <RequireAuth allowedRoles={['Admin', 'Editor']}><PropertyForm /></RequireAuth> },
          { path: "property/:id", element: <PropertyDetails /> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ]
  }
]);
