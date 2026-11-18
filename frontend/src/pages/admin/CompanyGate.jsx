import CompanyPendingPage from '../auth/CompanyPendingPage';
import React, { useEffect, useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminRequest } from "../../services/adminService";
export default function CompanyGate({ children }) {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState(null),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!token || user?.role !== "recruiter") return;
    let active = true;
    setStatus(null);
    setError("");
    adminRequest("/api/auth/company-status")
      .then((d) => {
        if (active) setStatus(d.status || "incheck");
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [token, user?.role, revision, location.pathname]);
  useEffect(() => {
    if (!token || user?.role !== 'recruiter' || status !== 'incheck') return;
    const timer = window.setInterval(() => { if (!document.hidden) setRevision(n => n + 1); }, 30000);
    return () => window.clearInterval(timer);
  }, [token, user?.role, status]);
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "recruiter")
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin/companies" : "/"}
        replace
      />
    );
  if (status === "passed") return children || <Navigate to="/hr" replace />;
  return <CompanyPendingPage status={status} error={error} loading={!status && !error}
    email={user?.email} onRefresh={() => setRevision(n => n + 1)} onLogout={logout}/>;
}
