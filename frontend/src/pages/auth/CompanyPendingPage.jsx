import React from "react";
import { Link } from "react-router-dom";
import {
  Clock3,
  ShieldCheck,
  CircleAlert,
  RotateCw,
  LogOut,
} from "lucide-react";
import "./CompanyPending.css";
export default function CompanyPendingPage({
  status,
  error,
  loading,
  onRefresh,
  onLogout,
  email,
}) {
  const failed = status === "failed";
  const Icon = error || failed ? CircleAlert : loading ? RotateCw : Clock3;
  return (
    <main className="company-pending">
      <header>
        <Link to="/">KONEK</Link>
        <span>Cổng nhà tuyển dụng</span>
      </header>
      <section aria-labelledby="pending-title">
        <div className="pending-symbol">
          <Icon aria-hidden="true" />
        </div>
        <span className="pending-label">
          {error
            ? "KIỂM TRA TRẠNG THÁI"
            : failed
              ? "KẾT QUẢ KIỂM DUYỆT"
              : "HỒ SƠ NHÀ TUYỂN DỤNG"}
        </span>
        <h1 id="pending-title">
          {error
            ? "Chưa thể kiểm tra trạng thái"
            : failed
              ? "Hồ sơ chưa được chấp thuận"
              : loading
                ? "Đang kiểm tra hồ sơ…"
                : "Đang chờ kiểm duyệt"}
        </h1>
        <p role={error ? "alert" : "status"}>
          {error ||
            (failed
              ? "Hồ sơ công ty chưa được quản trị viên chấp thuận. Vui lòng liên hệ quản trị viên để được hỗ trợ."
              : loading
                ? "Vui lòng chờ trong khi hệ thống kiểm tra trạng thái công ty."
                : "Thông tin tài khoản và công ty của bạn đã được ghi nhận. Quản trị viên sẽ kiểm tra hồ sơ trước khi mở quyền tuyển dụng.")}
        </p>
        {email && (
          <div className="pending-account">
            <span>Tài khoản đăng ký</span>
            <strong>{email}</strong>
          </div>
        )}
        <div className="pending-next">
          <ShieldCheck aria-hidden="true" />
          <p>
            Sau khi được duyệt, bạn có thể đăng tin tuyển dụng và quản lý ứng
            viên. Trang này tự cập nhật trạng thái.
          </p>
        </div>
        <div className="pending-actions">
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={onRefresh}
          >
            <RotateCw size={16} />
            {loading ? "Đang kiểm tra…" : "Kiểm tra lại"}
          </button>
          <button className="btn btn-ghost" onClick={onLogout}>
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
        <Link className="pending-home" to="/">
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
