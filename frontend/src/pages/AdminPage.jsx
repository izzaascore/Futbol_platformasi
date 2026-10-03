import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("scouts"); // 'scouts' | 'users' | 'tournaments' | 'audit'

    // Xavfsizlik tekshiruvi: Agar admin bo'lmasa, chiqarib yuborish
    useEffect(() => {
        const role = localStorage.getItem("role");
        const token = localStorage.getItem("token");
        if (!token || role !== "admin") {
            navigate("/login");
        }
    }, [navigate]);

    // Namunaviy statistika
    const stats = {
        totalPlayers: 142,
        totalScouts: 18,
        pendingScouts: 3,
        activeTournaments: 2,
    };

    // Tasdiqlash kutilayotgan skautlar ro'yxati (Klubi va litsenziyasi bilan)
    const [pendingScouts, setPendingScouts] = useState([
        {
            id: 1,
            name: "Akmal Karimov",
            club: "Paxtakor FK",
            roleInClub: "Bosh skaut",
            phone: "+998 90 123 45 67",
            docUrl: "license_paxtakor.pdf",
            registeredAt: "2026-10-02",
            status: "pending",
        },
        {
            id: 2,
            name: "Bobur Mirzayev",
            club: "Bunyodkor Akademiya",
            roleInClub: "Yoshlar bo'yicha skaut",
            phone: "+998 93 987 65 43",
            docUrl: "accreditation.pdf",
            registeredAt: "2026-10-03",
            status: "pending",
        },
    ]);

    // Turnirlar holati
    const tournaments = [
        {
            id: 101,
            name: "Toshkent Viloyati U-17",
            stage: "Chorak final",
            status: "Tugatilgan (Muzlatilgan)",
            isLocked: true,
        },
        {
            id: 102,
            name: "Kelajak Yulduzlari 2026",
            stage: "Guruh bosqichi",
            status: "Faol",
            isLocked: false,
        },
    ];

    // Xavfsizlik jurnali (Audit / Kirish urinishlari)
    const auditLogs = [
        {
            id: 1,
            event: "Muvaffaqiyatli kirish (Admin)",
            details: "Yagona admin paneldan kirdi",
            time: "Bugun, 15:20",
            type: "success",
        },
        {
            id: 2,
            event: "Shubhali kirish urinishi!",
            details: "Parolda maxfiy belgi terilmadi (IP: 195.158.3.14)",
            time: "Kecha, 22:45",
            type: "warning",
        },
    ];

    // Skautni tasdiqlash
    const handleApproveScout = (id) => {
        setPendingScouts((prev) => prev.filter((s) => s.id !== id));
        alert("Skaut muvaffaqiyatli tasdiqlandi va unga ruxsat berildi!");
    };

    // Skautni rad etish
    const handleRejectScout = (id) => {
        setPendingScouts((prev) => prev.filter((s) => s.id !== id));
        alert("Skaut arizasi rad etildi.");
    };

    // Chiqish (Logout)
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", padding: "24px", fontFamily: "sans-serif" }}>
            {/* Yuqori Panel (Header) */}
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "16px", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#38bdf8" }}>
                        🛡️ Boshqaruv Markazi (Admin)
                    </h1>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#94a3b8" }}>
                        Tizim nazoratchisi va moderator paneli (Faqat yagona admin uchun)
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                    Chiqish
                </button>
            </header>

            {/* Statistika Kartalari */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Jami Futbolchilar</span>
                    <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#22c55e" }}>{stats.totalPlayers}</h2>
                </div>
                <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Tasdiqlangan Skautlar</span>
                    <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#38bdf8" }}>{stats.totalScouts}</h2>
                </div>
                <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #eab308" }}>
                    <span style={{ fontSize: "13px", color: "#eab308" }}>Tasdiqlash kutilmoqda (Skaut)</span>
                    <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#eab308" }}>{pendingScouts.length}</h2>
                </div>
                <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Turnirlar</span>
                    <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#a855f7" }}>{stats.activeTournaments}</h2>
                </div>
            </div>

            {/* Tablar (Bo'limlar) */}
            <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #334155", paddingBottom: "8px", marginBottom: "20px" }}>
                <button
                    onClick={() => setActiveTab("scouts")}
                    style={{ background: activeTab === "scouts" ? "#38bdf8" : "#1e293b", color: activeTab === "scouts" ? "#0f172a" : "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                    Skautlarni tasdiqlash ({pendingScouts.length})
                </button>
                <button
                    onClick={() => setActiveTab("tournaments")}
                    style={{ background: activeTab === "tournaments" ? "#38bdf8" : "#1e293b", color: activeTab === "tournaments" ? "#0f172a" : "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                    Turnirlar nazorati
                </button>
                <button
                    onClick={() => setActiveTab("audit")}
                    style={{ background: activeTab === "audit" ? "#38bdf8" : "#1e293b", color: activeTab === "audit" ? "#0f172a" : "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                    Xavfsizlik jurnali
                </button>
            </div>

            {/* 1-Bo'lim: Skautlarni tasdiqlash */}
            {activeTab === "scouts" && (
                <div style={{ backgroundColor: "#1e293b", borderRadius: "8px", padding: "20px", border: "1px solid #334155" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#f1f5f9" }}>Yangi ro'yxatdan o'tgan skautlar arizalari</h3>
                    {pendingScouts.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Hozirda yangi arizalar yo'q.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {pendingScouts.map((scout) => (
                                <div key={scout.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                                    <div>
                                        <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#38bdf8" }}>{scout.name}</h4>
                                        <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1" }}>
                                            <strong>Klub:</strong> {scout.club} ({scout.roleInClub}) | <strong>Tel:</strong> {scout.phone}
                                        </p>
                                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
                                            Hujjat: <span style={{ color: "#38bdf8", textDecoration: "underline" }}>{scout.docUrl}</span> • Sana: {scout.registeredAt}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            onClick={() => handleApproveScout(scout.id)}
                                            style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                                        >
                                            Tasdiqlash
                                        </button>
                                        <button
                                            onClick={() => handleRejectScout(scout.id)}
                                            style={{ backgroundColor: "#b91c1c", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                                        >
                                            Rad etish
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 2-Bo'lim: Turnirlar nazorati */}
            {activeTab === "tournaments" && (
                <div style={{ backgroundColor: "#1e293b", borderRadius: "8px", padding: "20px", border: "1px solid #334155" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "8px", color: "#f1f5f9" }}>Turnirlar holati va audit</h3>
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
                        ⚠️ Yakunlangan bosqichlar muzlatilgan. Admin ham ularni shunchaki o'zgartira olmaydi (faqat favqulodda asosli sabab bilan).
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {tournaments.map((t) => (
                            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                                <div>
                                    <h4 style={{ margin: "0 0 4px 0", color: "#f8fafc" }}>{t.name}</h4>
                                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Bosqich: {t.stage}</span>
                                </div>
                                <div>
                                    <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", backgroundColor: t.isLocked ? "#475569" : "#1e3a8a", color: t.isLocked ? "#cbd5e1" : "#60a5fa" }}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3-Bo'lim: Xavfsizlik jurnali */}
            {activeTab === "audit" && (
                <div style={{ backgroundColor: "#1e293b", borderRadius: "8px", padding: "20px", border: "1px solid #334155" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#f1f5f9" }}>Tizimga kirish va xavfsizlik qaydlari</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {auditLogs.map((log) => (
                            <div key={log.id} style={{ padding: "12px", borderRadius: "6px", backgroundColor: "#0f172a", borderLeft: log.type === "warning" ? "4px solid #ef4444" : "4px solid #22c55e" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong style={{ color: log.type === "warning" ? "#f87171" : "#4ade80" }}>{log.event}</strong>
                                    <span style={{ fontSize: "12px", color: "#64748b" }}>{log.time}</span>
                                </div>
                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>{log.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}