import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { api } from "../services/api";
import "../styles/Dashboard.css";

export const ReportsPage = () => {
  const { token } = useAuth();
  const [budgetReport, setBudgetReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetReport();
  }, [token, fetchBudgetReport]);

  const fetchBudgetReport = async () => {
    try {
      const data = await api.fetchReports("budget", token);
      setBudgetReport(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching report:", err);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Reports & Analytics</h1>
        <p>Budget & Fund Allocation Overview</p>
      </div>

      <div className="dashboard-content">
        <section className="reports-section">
          <h2>Budget Summary by Project</h2>
          {loading ? (
            <p>Loading...</p>
          ) : budgetReport.length === 0 ? (
            <p>No projects available.</p>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Total Budget</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {budgetReport.map((report) => (
                  <tr key={report.projectId}>
                    <td>{report.projectName}</td>
                    <td>${(report.totalBudget || 0).toLocaleString()}</td>
                    <td>
                      ${(report.approvedDisbursements || 0).toLocaleString()}
                    </td>
                    <td>
                      ${(report.pendingDisbursements || 0).toLocaleString()}
                    </td>
                    <td>${(report.remainingBudget || 0).toLocaleString()}</td>
                    <td>{report.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};
