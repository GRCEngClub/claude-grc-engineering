import { useState, useEffect, useCallback } from "react";

// ─── Configuration ──────────────────────────────────────────
// In production these come from environment variables or the /api/config endpoint.
// Demo mode uses generic sample data. Replace with your own via the seed script
// or the /api/admin/config endpoint after deploying.
const DEMO_MODE = true;

const DEMO_CONFIG = {
  companyName: "Acme Corp",
  tagline: "Security & Compliance",
  description:
    "Acme Corp is committed to protecting your data. We maintain rigorous compliance standards and undergo independent audits to ensure the security, availability, and confidentiality of our platform.",
  primaryColor: "#1a56db",
  contactEmail: "security@acmecorp.example.com",
  certifications: [
    {
      name: "SOC 2 Type II",
      status: "active",
      description:
        "System and Organization Controls — Security trust services criteria",
      auditPeriod: "Jan 2026 – Jun 2026",
      auditor: "Example Audit Firm",
      badge: "soc2",
    },
    {
      name: "SOC 3",
      status: "active",
      description:
        "General use report on Security controls — publicly downloadable",
      auditPeriod: "Jan 2026 – Jun 2026",
      auditor: "Example Audit Firm",
      badge: "soc3",
    },
  ],
  complianceStats: {
    totalControls: 42,
    trustServicesCriteria: 30,
    complianceRate: "97%",
    currentAuditPeriod: "Jul 1, 2026 – Jun 30, 2027",
  },
};

const DEMO_DOCUMENTS = [
  {
    id: "soc3-report",
    name: "SOC 3 Report",
    description: "General use report on system controls — publicly available",
    category: "Audit Reports",
    accessLevel: "public",
    fileType: "pdf",
    downloadable: true,
  },
  {
    id: "soc2-type2",
    name: "SOC 2 Type II Report",
    description:
      "Detailed report on the design and operating effectiveness of security controls",
    category: "Audit Reports",
    accessLevel: "gated",
    fileType: "pdf",
    downloadable: false,
  },
  {
    id: "pol-infosec",
    name: "Information Security Policy",
    description: "Overarching policy governing information asset protection",
    category: "Policies",
    accessLevel: "gated",
    fileType: "pdf",
    downloadable: false,
  },
  {
    id: "pol-access",
    name: "Access Control Policy",
    description: "User provisioning, role-based access, and offboarding procedures",
    category: "Policies",
    accessLevel: "gated",
    fileType: "pdf",
    downloadable: false,
  },
  {
    id: "pol-bcdr",
    name: "Business Continuity & Disaster Recovery Plan",
    description: "Procedures for maintaining operations during disruptions",
    category: "Policies",
    accessLevel: "gated",
    fileType: "pdf",
    downloadable: false,
  },
  {
    id: "pol-incident",
    name: "Incident Response Plan",
    description: "Detection, response, and recovery procedures for security events",
    category: "Policies",
    accessLevel: "gated",
    fileType: "pdf",
    downloadable: false,
  },
  {
    id: "pol-privacy",
    name: "Privacy & Data Protection Policy",
    description: "Data subject rights and privacy law compliance",
    category: "Policies",
    accessLevel: "gated",
    fileType: "pdf",
    downloadable: false,
  },
  {
    id: "pol-vendor",
    name: "Vendor Management Policy",
    description: "Third-party risk assessment and ongoing monitoring",
    category: "Policies",
    accessLevel: "gated",
    fileType: "pdf",
    downloadable: false,
  },
];

// ─── Styles ─────────────────────────────────────────────────
const baseFont =
  "'DM Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
const monoFont = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";

const palette = {
  bg: "#0a0f1a",
  surface: "#111827",
  surfaceHover: "#1a2332",
  border: "#1e293b",
  borderLight: "#334155",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  accent: "#3b82f6",
  accentGlow: "rgba(59, 130, 246, 0.15)",
  green: "#10b981",
  greenGlow: "rgba(16, 185, 129, 0.15)",
  amber: "#f59e0b",
  amberGlow: "rgba(245, 158, 11, 0.12)",
  red: "#ef4444",
};

// ─── Icons (inline SVG) ─────────────────────────────────────
const ShieldIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const DownloadIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const FileIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const CheckCircleIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ─── Components ─────────────────────────────────────────────

function CertBadge({ cert }) {
  return (
    <div
      style={{
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: 16,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        transition: "border-color 0.2s, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.accent;
        e.currentTarget.style.boxShadow = `0 0 24px ${palette.accentGlow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: palette.greenGlow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldIcon size={22} color={palette.green} />
        </div>
        <div>
          <div
            style={{
              fontFamily: baseFont,
              fontWeight: 700,
              fontSize: 16,
              color: palette.text,
              letterSpacing: "-0.01em",
            }}
          >
            {cert.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 2,
            }}
          >
            <CheckCircleIcon size={13} color={palette.green} />
            <span
              style={{
                fontFamily: monoFont,
                fontSize: 11,
                color: palette.green,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Active
            </span>
          </div>
        </div>
      </div>
      <p
        style={{
          fontFamily: baseFont,
          fontSize: 14,
          color: palette.textMuted,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {cert.description}
      </p>
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 12,
          color: palette.textDim,
          fontFamily: monoFont,
        }}
      >
        <span>{cert.auditPeriod}</span>
        <span style={{ color: palette.borderLight }}>·</span>
        <span>{cert.auditor}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: "20px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: monoFont,
          fontSize: 28,
          fontWeight: 700,
          color: palette.accent,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: baseFont,
          fontSize: 12,
          color: palette.textDim,
          marginTop: 4,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function DocumentRow({ doc, onRequestAccess }) {
  const isPublic = doc.accessLevel === "public";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: `1px solid ${palette.border}`,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = palette.surfaceHover)
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: isPublic ? palette.greenGlow : palette.accentGlow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FileIcon
            size={16}
            color={isPublic ? palette.green : palette.accent}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: baseFont,
              fontSize: 14,
              fontWeight: 600,
              color: palette.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {doc.name}
          </div>
          <div
            style={{
              fontFamily: baseFont,
              fontSize: 12,
              color: palette.textDim,
              marginTop: 2,
            }}
          >
            {doc.description}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          marginLeft: 16,
        }}
      >
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 10,
            color: isPublic ? palette.green : palette.amber,
            background: isPublic ? palette.greenGlow : palette.amberGlow,
            padding: "3px 8px",
            borderRadius: 6,
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          {doc.fileType}
        </span>

        {isPublic ? (
          <button
            onClick={() => {}}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: baseFont,
              fontSize: 13,
              fontWeight: 600,
              color: palette.green,
              background: palette.greenGlow,
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            <DownloadIcon size={14} color={palette.green} />
            Download
          </button>
        ) : (
          <button
            onClick={() => onRequestAccess(doc)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: baseFont,
              fontSize: 13,
              fontWeight: 600,
              color: palette.accent,
              background: palette.accentGlow,
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            <LockIcon size={13} color={palette.accent} />
            Request
          </button>
        )}
      </div>
    </div>
  );
}

function AccessRequestModal({ document: doc, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    reason: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.email || !form.name) return;
    onSubmit(doc.id, form);
    setSubmitted(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 20,
          padding: 32,
          width: "100%",
          maxWidth: 480,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: palette.textDim,
            padding: 4,
          }}
        >
          <XIcon size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: palette.greenGlow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircleIcon size={28} color={palette.green} />
            </div>
            <h3
              style={{
                fontFamily: baseFont,
                fontSize: 20,
                fontWeight: 700,
                color: palette.text,
                margin: "0 0 8px",
              }}
            >
              Request Submitted
            </h3>
            <p
              style={{
                fontFamily: baseFont,
                fontSize: 14,
                color: palette.textMuted,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              We'll review your request and email you when access is granted. You
              may be asked to sign an NDA before downloading sensitive documents.
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontFamily: baseFont,
                  fontSize: 20,
                  fontWeight: 700,
                  color: palette.text,
                  margin: "0 0 4px",
                }}
              >
                Request Access
              </h3>
              <p
                style={{
                  fontFamily: baseFont,
                  fontSize: 14,
                  color: palette.textMuted,
                  margin: 0,
                }}
              >
                {doc?.name}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "name", label: "Full Name", required: true },
                { key: "email", label: "Business Email", required: true, type: "email" },
                { key: "company", label: "Company" },
                { key: "reason", label: "Reason for Request", multiline: true },
              ].map(({ key, label, required, type, multiline }) => (
                <div key={key}>
                  <label
                    style={{
                      fontFamily: baseFont,
                      fontSize: 12,
                      fontWeight: 600,
                      color: palette.textDim,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {label}
                    {required && (
                      <span style={{ color: palette.red, marginLeft: 2 }}>
                        *
                      </span>
                    )}
                  </label>
                  {multiline ? (
                    <textarea
                      rows={3}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        fontFamily: baseFont,
                        fontSize: 14,
                        color: palette.text,
                        background: palette.bg,
                        border: `1px solid ${palette.borderLight}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        resize: "vertical",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  ) : (
                    <input
                      type={type || "text"}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        fontFamily: baseFont,
                        fontSize: 14,
                        color: palette.text,
                        background: palette.bg,
                        border: `1px solid ${palette.borderLight}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.name || !form.email}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                fontFamily: baseFont,
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                background:
                  form.name && form.email ? palette.accent : palette.borderLight,
                border: "none",
                borderRadius: 12,
                padding: "14px 0",
                marginTop: 20,
                cursor: form.name && form.email ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}
            >
              <SendIcon size={15} />
              Submit Request
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────
export default function TrustCenter() {
  const [config, setConfig] = useState(DEMO_MODE ? DEMO_CONFIG : null);
  const [documents, setDocuments] = useState(DEMO_MODE ? DEMO_DOCUMENTS : []);
  const [filter, setFilter] = useState("all"); // "all" | "reports" | "policies"
  const [requestModal, setRequestModal] = useState(null);
  const [loading, setLoading] = useState(!DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) return;
    Promise.all([
      fetch("/api/config").then((r) => r.json()),
      fetch("/api/documents").then((r) => r.json()),
    ]).then(([cfg, docs]) => {
      setConfig(cfg);
      setDocuments(docs.documents || []);
      setLoading(false);
    });
  }, []);

  const handleRequestAccess = useCallback((docId, form) => {
    if (DEMO_MODE) return;
    fetch(`/api/documents/${docId}/request-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  }, []);

  const filteredDocs = documents.filter((d) => {
    if (filter === "reports") return d.category === "Audit Reports";
    if (filter === "policies") return d.category === "Policies";
    return true;
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: palette.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: baseFont,
          color: palette.textMuted,
        }}
      >
        Loading trust center...
      </div>
    );
  }

  const stats = config?.complianceStats;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: palette.bg,
        color: palette.text,
        fontFamily: baseFont,
      }}
    >
      {/* ── Ambient glow ── */}
      <div
        style={{
          position: "fixed",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Header ── */}
        <header
          style={{
            padding: "48px 0 20px",
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${palette.accent}, #6366f1)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldIcon size={20} color="#fff" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: palette.textDim,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Trust Center
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: palette.text,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {config?.companyName}
              </h1>
            </div>
          </div>
          <p
            style={{
              fontSize: 15,
              color: palette.textMuted,
              lineHeight: 1.6,
              margin: "16px 0 0",
              maxWidth: 640,
            }}
          >
            {config?.description}
          </p>
        </header>

        {/* ── Certifications ── */}
        <section style={{ padding: "40px 0 0" }}>
          <h2
            style={{
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: 600,
              color: palette.textDim,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: "0 0 20px",
            }}
          >
            Active Certifications
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {config?.certifications?.map((cert, i) => (
              <CertBadge key={i} cert={cert} />
            ))}
          </div>
        </section>

        {/* ── Compliance Stats ── */}
        {stats && (
          <section style={{ padding: "36px 0 0" }}>
            <h2
              style={{
                fontFamily: monoFont,
                fontSize: 11,
                fontWeight: 600,
                color: palette.textDim,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "0 0 16px",
              }}
            >
              Current Compliance Posture
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
              }}
            >
              <StatCard label="Controls" value={stats.totalControls} />
              <StatCard label="TSC Criteria" value={stats.trustServicesCriteria} />
              <StatCard label="Compliance Rate" value={stats.complianceRate} />
              <StatCard label="Active Audit" value="2026–27" />
            </div>
          </section>
        )}

        {/* ── Documents ── */}
        <section style={{ padding: "40px 0 60px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2
              style={{
                fontFamily: monoFont,
                fontSize: 11,
                fontWeight: 600,
                color: palette.textDim,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: 0,
              }}
            >
              Documents & Policies
            </h2>
            <div style={{ display: "flex", gap: 4 }}>
              {["all", "reports", "policies"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontFamily: monoFont,
                    fontSize: 11,
                    fontWeight: 600,
                    color: filter === f ? palette.text : palette.textDim,
                    background:
                      filter === f ? palette.surfaceHover : "transparent",
                    border: `1px solid ${filter === f ? palette.borderLight : "transparent"}`,
                    borderRadius: 8,
                    padding: "6px 12px",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    transition: "all 0.15s",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {filteredDocs.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: palette.textDim,
                  fontSize: 14,
                }}
              >
                No documents in this category.
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  onRequestAccess={(d) => setRequestModal(d)}
                />
              ))
            )}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 20,
              fontSize: 12,
              fontFamily: monoFont,
              color: palette.textDim,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <DownloadIcon size={12} color={palette.green} />
              <span>Public — download directly</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LockIcon size={12} color={palette.accent} />
              <span>Gated — submit access request</span>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: `1px solid ${palette.border}`,
            padding: "24px 0 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, color: palette.textDim, fontFamily: monoFont }}>
            {config?.companyName} Trust Center · Last updated {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </div>
          <div style={{ fontSize: 12, color: palette.textDim, fontFamily: baseFont }}>
            Questions? Contact{" "}
            <a
              href={`mailto:${config?.contactEmail}`}
              style={{ color: palette.accent, textDecoration: "none" }}
            >
              {config?.contactEmail}
            </a>
          </div>
        </footer>
      </div>

      {/* ── Access Request Modal ── */}
      {requestModal && (
        <AccessRequestModal
          document={requestModal}
          onClose={() => setRequestModal(null)}
          onSubmit={handleRequestAccess}
        />
      )}

      {/* ── Google Fonts ── */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
