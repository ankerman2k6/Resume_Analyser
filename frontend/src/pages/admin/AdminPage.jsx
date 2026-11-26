import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  BriefcaseBusiness,
  Check,
  RotateCw,
  Menu,
  X,
  Moon,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminRequest } from "../../services/adminService";
import logo from "./admin-logo.svg";
import darkLogo from "./admin-logo-dark.svg";
import "./Admin.css";

const labels = {
  incheck: "Chờ duyệt",
  passed: "Đã duyệt",
  failed: "Từ chối",
  draft: "Chờ duyệt",
  published: "Đã đăng",
  closed: "Đã đóng",
};
const date = (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa cập nhật";
const text = (value) => value || "Chưa cập nhật";
export default function AdminPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { section = "companies" } = useParams();
  const company = section === "companies";
  const [status, setStatus] = useState("");
  const filter = status || (company ? "incheck" : "draft");
  const [page, setPage] = useState(0),
    [rows, setRows] = useState([]),
    [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0),
    [mobile, setMobile] = useState(false),
    [menu, setMenu] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setSelected(null);
    setRows([]);
    adminRequest(
      `/api/admin/${section}?status=${filter}&page=${page}&size=20`,
      { signal: controller.signal },
    )
      .then((data) => {
        setRows(data);
        setSelected(data[0] || null);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [section, filter, page, refresh, token, user?.role]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setMobile(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  if (!["companies", "jobs"].includes(section))
    return <Navigate to="/admin/companies" replace />;
  const switchSection = (next) => {
    setStatus("");
    setPage(0);
    setMenu(false);
    setMobile(false);
    navigate(`/admin/${next}`);
  };
  const review = async (decision) => {
    if (busy || !selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/api/admin/${section}/${encodeURIComponent(selected.id)}/${company ? "review" : "approve"}`,
        {
          method: "PATCH",
          ...(company ? { body: JSON.stringify({ status: decision }) } : {}),
        },
      );
      setNotice(
        company
          ? decision === "passed"
            ? "Đã duyệt công ty."
            : "Đã từ chối công ty."
          : "Đã duyệt đăng tin.",
      );
      setMobile(false);
      setRefresh((n) => n + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const expired =
    selected?.deadline && new Date(selected.deadline).getTime() <= Date.now();
  const pending = company
    ? selected?.status === "incheck"
    : selected?.status === "draft";
  const badge = (row) => (
    <span
      className={`badge ${["passed", "published"].includes(row.status) ? "success" : row.status === "failed" ? "danger" : ""}`}
    >
      {labels[row.status] || "Chưa cập nhật"}
    </span>
  );
  const detail = selected && (
    <div className="detail">
      <div className="detail-top">
        <div>
          <span className="eyebrow">
            {company ? "HỒ SƠ CÔNG TY" : "NỘI DUNG TUYỂN DỤNG"}
          </span>
          <h2>{company ? selected.name : selected.title}</h2>
          {company && <p className="muted">{text(selected.industry)}</p>}
        </div>
        <button
          className="mobile-only"
          aria-label="Đóng chi tiết"
          onClick={() => setMobile(false)}
        >
          <X />
        </button>
      </div>
      <dl>
        <div>
          <dt>Trạng thái</dt>
          <dd>{badge(selected)}</dd>
        </div>
        {company ? (
          <>
            <div>
              <dt>Website</dt>
              <dd>
                {/^https?:\/\//i.test(selected.website || "") ? (
                  <a href={selected.website} target="_blank" rel="noreferrer">
                    {selected.website}
                  </a>
                ) : (
                  text(selected.website)
                )}
              </dd>
            </div>
            <div>
              <dt>Quy mô</dt>
              <dd>{text(selected.size)}</dd>
            </div>
            <div>
              <dt>Địa chỉ</dt>
              <dd>
                {selected.locations
                  ?.map((l) =>
                    [l.address, l.city, l.country].filter(Boolean).join(", "),
                  )
                  .join("; ") || "Chưa cập nhật"}
              </dd>
            </div>
            <div>
              <dt>Ngày đăng ký</dt>
              <dd>{date(selected.createdAt)}</dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>Địa điểm</dt>
              <dd>{text(selected.location?.city)}</dd>
            </div>
            <div>
              <dt>Hình thức</dt>
              <dd>
                {{
                  full_time: "Toàn thời gian",
                  part_time: "Bán thời gian",
                  internship: "Thực tập",
                  contract: "Hợp đồng",
                  freelance: "Tự do",
                }[selected.employmentType] || text(selected.employmentType)}
              </dd>
            </div>
            <div>
              <dt>Mức lương</dt>
              <dd>
                {selected.salary?.negotiable
                  ? "Thỏa thuận"
                  : selected.salary
                    ? [selected.salary.min, selected.salary.max]
                        .filter((v) => v != null)
                        .map((v) => Number(v).toLocaleString("vi-VN"))
                        .join(" – ") +
                      " " +
                      (selected.salary.currency || "")
                    : "Chưa cập nhật"}
              </dd>
            </div>
            <div>
              <dt>Kinh nghiệm</dt>
              <dd>
                {selected.experience
                  ? [selected.experience.minYears, selected.experience.maxYears]
                      .filter((v) => v != null)
                      .join(" – ") + " năm"
                  : "Chưa cập nhật"}
              </dd>
            </div>
            <div>
              <dt>Hạn ứng tuyển</dt>
              <dd>
                {date(selected.deadline)}
                {expired ? " · Đã hết hạn" : ""}
              </dd>
            </div>
          </>
        )}
      </dl>
      <section className="section">
        <h3>{company ? "Giới thiệu công ty" : "Mô tả công việc"}</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{text(selected.description)}</p>
      </section>
      {!company && (
        <>
          <section className="section">
            <h3>Yêu cầu ứng viên</h3>
            <p>
              {selected.requirements?.requiredSkills?.join(", ") ||
                "Chưa cập nhật"}
            </p>
            <p>{selected.requirements?.preferredSkills?.join(", ")}</p>
            <p>
              {selected.requirements?.education?.minimumDegree}{" "}
              {selected.requirements?.education?.preferredMajors?.join(", ")}
            </p>
            <p>
              {selected.requirements?.languages
                ?.map((l) =>
                  [l.name, l.minimumLevel].filter(Boolean).join(": "),
                )
                .join("; ")}
            </p>
            {selected.requirements?.minimumGpa && (
              <p>
                GPA tối thiểu: {selected.requirements.minimumGpa.value}/
                {selected.requirements.minimumGpa.scale}
              </p>
            )}
          </section>
          <section className="section">
            <h3>Quyền lợi</h3>
            <ul>
              {selected.benefits?.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
        </>
      )}
      {pending && (
        <>
          <div className="note">
            {expired && !company
              ? "Tin đã hết hạn ứng tuyển, không thể duyệt đăng."
              : company
                ? "Sau khi được duyệt, nhà tuyển dụng có thể sử dụng phân hệ HR."
                : "Sau khi được duyệt, tin sẽ xuất hiện trên trang tìm việc."}
          </div>
          <div className="actions">
            {company && (
              <button
                disabled={busy}
                className="danger-button"
                onClick={() => review("failed")}
              >
                Từ chối
              </button>
            )}
            <button
              disabled={busy || (!company && (!selected.deadline || expired))}
              className="primary"
              onClick={() => review("passed")}
            >
              <Check />
              {busy
                ? "Đang xử lý…" : company ? "Duyệt công ty" : "Duyệt đăng tin"}
            </button>
          </div>
        </>
      )}
    </div>
  );
  return (
    <div className="admin-ui">
      <div className="app">
        <aside className={`sidebar ${menu ? "open" : ""}`}>
          <div className="brand">
            <img className="admin-logo-light" src={logo} alt="KONEK" />
            <img className="admin-logo-dark" src={darkLogo} alt="KONEK" />
          </div>
          <div className="eyebrow navlabel">QUẢN TRỊ</div>
          <nav className="nav">
            <button
              disabled={busy}
              className={company ? "active" : ""}
              onClick={() => switchSection("companies")}
            >
              <Building2 />
              Duyệt công ty
            </button>
            <button
              disabled={busy}
              className={!company ? "active" : ""}
              onClick={() => switchSection("jobs")}
            >
              <BriefcaseBusiness />
              Tin tuyển dụng
            </button>
          </nav>
          <div className="sidebar-footer">
            <button
              onClick={() => {
                const root = document.documentElement;
                root.dataset.theme =
                  root.dataset.theme === "dark" ? "light" : "dark";
                localStorage.setItem("konek_theme", root.dataset.theme);
              }}
            >
              <Moon />
              Đổi giao diện
            </button>
            <button
              className="danger-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut />
              Đăng xuất
            </button>
          </div>
        </aside>
        <div className="content">
          <header className="header">
            <div className="group">
              <button
                className="mobile-only"
                aria-label="Mở menu"
                onClick={() => setMenu(!menu)}
              >
                <Menu />
              </button>
              <span className="muted">Không gian quản trị</span>
            </div>
            <div className="account">
              <span className="muted">{user.email}</span>
              <div className="rr">AD</div>
            </div>
          </header>
          <main className="page">
            <div className="intro">
              <div>
                <h1>{company ? "Duyệt công ty" : "Duyệt tin tuyển dụng"}</h1>
                <p>
                  {company
                    ? "Kiểm tra hồ sơ trước khi cấp quyền tuyển dụng."
                    : "Xem nội dung trước khi công khai với ứng viên."}
                </p>
              </div>
              <button
                disabled={busy || loading}
                aria-label="Làm mới"
                onClick={() => setRefresh((n) => n + 1)}
              >
                <RotateCw />
                <span>Làm mới</span>
              </button>
            </div>
            <div className="tabs">
              {(company
                ? ["incheck", "passed", "failed"]
                : ["draft", "published", "closed"]
              ).map((s) => (
                <button
                  disabled={busy}
                  key={s}
                  className={filter === s ? "active" : ""}
                  onClick={() => {
                    setStatus(s);
                    setPage(0);
                  }}
                >
                  {labels[s]}
                </button>
              ))}
            </div>
            {notice && (
              <p role="status" className="note">
                {notice}
              </p>
            )}
            {error && (
              <div role="alert" className="note">
                {error}{" "}
                <button onClick={() => setRefresh((n) => n + 1)}>
                  Thử lại
                </button>
              </div>
            )}
            <div className="workspace">
              {loading ? (
                <div className="empty" role="status">
                  Đang tải danh sách…
                </div>
              ) : error && !rows.length ? (
                <div className="empty">Không tải được danh sách.</div>
              ) : !rows.length ? (
                <div className="empty">Không có hồ sơ trong danh sách này.</div>
              ) : (
                <div className="split">
                  <div className="queue">
                    <div className="queue-label">
                      {rows.length}{" "}
                      {company ? "hồ sơ công ty" : "tin tuyển dụng"} · Trang{" "}
                      {page + 1}
                    </div>
                    {rows.map((row) => (
                      <button
                        disabled={busy}
                        key={row.id}
                        className={`queue-item ${row.id === selected?.id ? "selected" : ""}`}
                        aria-current={row.id === selected?.id}
                        onClick={() => {
                          setSelected(row);
                          setMobile(true);
                        }}
                      >
                        <div className="entity">
                          <div className="avatar overflow-hidden">
                            {company && row.logoUrl?.trim() ?(
                              <img src={row.logoUrl} alt="" className="" />
                            ):
                            ((row.name || row.title || "?").slice(0, 2).toUpperCase())}
                          </div>
                          <div>
                            <div className="title">{row.name || row.title}</div>
                            <small>
                              {company
                                ? text(row.industry)
                                : text(row.location?.city)}
                            </small>
                          </div>
                        </div>
                        <div className="rowmeta">
                          {badge(row)}
                          <small>
                            {date(company ? row.createdAt : row.deadline)}
                          </small>
                        </div>
                      </button>
                    ))}
                  </div>
                  {detail}
                </div>
              )}
            </div>
            <div className="pagination">
              <button
                disabled={busy || loading || page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Trang trước
              </button>
              <span>Trang {page + 1}</span>
              <button
                disabled={busy || loading || rows.length < 20}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </button>
            </div>
          </main>
        </div>
      </div>
      {mobile && <div className="admin-mobile-detail">{detail}</div>}
    </div>
  );
}
