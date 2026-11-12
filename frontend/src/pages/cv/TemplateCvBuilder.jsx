import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  createCvFromTemplateApi,
  getCandidateCvFileApi,
} from "../../services/candidateService";
import {
  getCvTemplateDetailApi,
  getCvTemplatesApi,
} from "../../services/cvTemplateService";
import "./TemplateCvBuilder.css";

const blankExperience = () => ({
  role: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
});
const blankEducation = () => ({
  school: "",
  degree: "",
  startDate: "",
  endDate: "",
  description: "",
});
const initialForm = () => ({
  title: "",
  fullName: "",
  email: "",
  phone: "",
  location: "",
  links: "",
  summary: "",
  experience: [],
  education: [],
  skills: "",
});
const splitLines = (value) =>
  value
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
const splitLinks = (value) =>
  value
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

function TemplateCvBuilder() {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);
  const [selectingId, setSelectingId] = useState(null);
  const [selectError, setSelectError] = useState("");
  const [brokenImages, setBrokenImages] = useState({});
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [createdCv, setCreatedCv] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfError, setPdfError] = useState("");
  const detailRequest = useRef(0);
  const editorRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setListError("");
    getCvTemplatesApi({ page, size: 6, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setListError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, reload]);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );

  const selectTemplate = async (template) => {
    const requestId = ++detailRequest.current;
    setSelectingId(template.id);
    setSelectError("");
    setSaveError("");
    try {
      const detail = await getCvTemplateDetailApi(template.id);
      if (requestId !== detailRequest.current) return;
      setSelected(detail);
      setCreatedCv(null);
      setPdfUrl("");
      setPdfError("");
      setForm(initialForm());
      requestAnimationFrame(() =>
        editorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    } catch (error) {
      if (requestId === detailRequest.current) setSelectError(error.message);
    } finally {
      if (requestId === detailRequest.current) setSelectingId(null);
    }
  };

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const updateItem = (section, index, field, value) =>
    setForm((prev) => ({
      ...prev,
      [section]: prev[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  const addItem = (section) =>
    setForm((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        section === "experience" ? blankExperience() : blankEducation(),
      ],
    }));
  const removeItem = (section, index) =>
    setForm((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, itemIndex) => itemIndex !== index),
    }));

  const loadPdf = async (cvId) => {
    setPdfError("");
    try {
      const blob = await getCandidateCvFileApi(cvId);
      setPdfUrl(URL.createObjectURL(blob));
    } catch (error) {
      setPdfError(error.message || "Không thể mở PDF. Vui lòng thử lại.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true);
    setSaveError("");
    const payload = {
      templateId: selected.id,
      title: form.title.trim(),
      content: {
        personalInfo: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          location: form.location.trim(),
          links: splitLinks(form.links),
        },
        summary: form.summary.trim(),
        experience: form.experience,
        education: form.education,
        skills: splitLines(form.skills),
      },
    };
    try {
      const cv = await createCvFromTemplateApi(payload);
      setCreatedCv(cv);
      await loadPdf(cv._id);
    } catch (error) {
      setSaveError(error.message || "Không thể tạo CV. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const sections = new Set(
    selected?.editorSchema?.sections?.map((section) => section.key) || [],
  );
  const showSection = (key) => !selected?.editorSchema || sections.has(key);

  return (
    <section className="template-builder" aria-labelledby="template-heading">
      <header className="template-builder-head">
        <div>
          <h2 id="template-heading">Tạo CV từ mẫu</h2>
          <p>Chọn thiết kế, nhập thông tin rồi lưu thành PDF.</p>
        </div>
        {!loading && !listError && result && (
          <span>{result.totalElements} mẫu khả dụng</span>
        )}
      </header>

      {loading ? (
        <div
          className="template-grid"
          role="status"
          aria-label="Đang tải mẫu CV"
        >
          {[0, 1, 2].map((n) => (
            <div className="template-skeleton" key={n} />
          ))}
        </div>
      ) : listError ? (
        <div className="template-state" role="alert">
          <strong>Không tải được mẫu CV</strong>
          <p>{listError}</p>
          <button type="button" onClick={() => setReload((n) => n + 1)}>
            Thử lại
          </button>
        </div>
      ) : !result?.content?.length ? (
        <div className="template-state">
          <strong>Chưa có mẫu CV khả dụng</strong>
          <p>Bạn vẫn có thể tải PDF của mình ở phía trên.</p>
        </div>
      ) : (
        <>
          <div className="template-grid">
            {result.content.map((template) => (
              <article
                className={`template-card ${selected?.id === template.id ? "is-selected" : ""}`}
                key={template.id}
              >
                <div className="template-card-preview">
                  {template.thumbnailUrl && !brokenImages[template.id] ? (
                    <img
                      src={template.thumbnailUrl}
                      alt={`Xem trước mẫu ${template.name}`}
                      loading="lazy"
                      onError={() =>
                        setBrokenImages((prev) => ({
                          ...prev,
                          [template.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <span>Chưa có ảnh xem trước</span>
                  )}
                </div>
                <div className="template-card-body">
                  <h3>{template.name}</h3>
                  <p>{template.description || "Mẫu CV sẵn sàng sử dụng."}</p>
                  <button
                    type="button"
                    onClick={() => selectTemplate(template)}
                    disabled={Boolean(selectingId) || saving}
                    aria-pressed={selected?.id === template.id}
                  >
                    {selectingId === template.id
                      ? "Đang mở…"
                      : selected?.id === template.id
                        ? "Đang dùng mẫu này"
                        : "Dùng mẫu này"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {result.totalPages > 1 && (
            <nav className="template-pagination" aria-label="Phân trang mẫu CV">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((n) => n - 1)}
              >
                Trang trước
              </button>
              <span>
                Trang {page + 1}/{result.totalPages}
              </span>
              <button
                type="button"
                disabled={result.last}
                onClick={() => setPage((n) => n + 1)}
              >
                Trang sau
              </button>
            </nav>
          )}
        </>
      )}
      {selectError && (
        <p className="template-error" role="alert">
          {selectError}
        </p>
      )}

      {selected && (
        <div className="template-editor" ref={editorRef}>
          <div className="template-editor-head">
            <div>
              <h2>Nhập nội dung CV</h2>
              <p>Mẫu: {selected.name}</p>
            </div>
            <button
              type="button"
              className="template-text-button"
              onClick={() => {
                setSelected(null);
                setCreatedCv(null);
                setPdfUrl("");
              }}
            >
              Đổi mẫu
            </button>
          </div>
          {!createdCv ? (
            <form onSubmit={submit}>
              <div className="template-form-grid">
                <label className="full">
                  Tiêu đề CV
                  <input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    maxLength={150}
                    required
                    placeholder="Ví dụ: CV Nguyễn Minh Anh"
                  />
                </label>
                <label>
                  Họ và tên
                  <input
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    maxLength={120}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={254}
                    required
                  />
                </label>
                <label>
                  Số điện thoại
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    maxLength={30}
                  />
                </label>
                <label>
                  Địa điểm
                  <input
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    maxLength={120}
                  />
                </label>
                <label className="full">
                  Liên kết <small>Mỗi dòng một URL http:// hoặc https://</small>
                  <textarea
                    value={form.links}
                    onChange={(e) => update("links", e.target.value)}
                    rows={2}
                    placeholder="https://github.com/ten-cua-ban"
                  />
                </label>
                {showSection("summary") && (
                  <label className="full">
                    Giới thiệu
                    <textarea
                      value={form.summary}
                      onChange={(e) => update("summary", e.target.value)}
                      maxLength={5000}
                      rows={4}
                    />
                  </label>
                )}
              </div>
              {showSection("experience") && (
                <div className="template-repeat-section">
                  <div className="template-repeat-head">
                    <h3>Kinh nghiệm</h3>
                    <button
                      type="button"
                      onClick={() => addItem("experience")}
                      disabled={form.experience.length >= 30}
                    >
                      + Thêm mục
                    </button>
                  </div>
                  {form.experience.map((item, index) => (
                    <div className="template-repeat-item" key={index}>
                      <div className="template-repeat-head">
                        <strong>Mục {index + 1}</strong>
                        <button
                          type="button"
                          onClick={() => removeItem("experience", index)}
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="template-form-grid">
                        {[
                          ["role", "Vai trò"],
                          ["company", "Công ty"],
                          ["startDate", "Bắt đầu"],
                          ["endDate", "Kết thúc"],
                          ["description", "Mô tả"],
                        ].map(([key, label]) => (
                          <label
                            key={key}
                            className={key === "description" ? "full" : ""}
                          >
                            {label}
                            {key === "description" ? (
                              <textarea
                                value={item[key]}
                                onChange={(e) =>
                                  updateItem(
                                    "experience",
                                    index,
                                    key,
                                    e.target.value,
                                  )
                                }
                                maxLength={2000}
                                rows={3}
                              />
                            ) : (
                              <input
                                value={item[key]}
                                onChange={(e) =>
                                  updateItem(
                                    "experience",
                                    index,
                                    key,
                                    e.target.value,
                                  )
                                }
                                maxLength={
                                  key === "company"
                                    ? 150
                                    : key.includes("Date")
                                      ? 30
                                      : 120
                                }
                                placeholder={
                                  key.includes("Date") ? "YYYY-MM" : undefined
                                }
                              />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSection("education") && (
                <div className="template-repeat-section">
                  <div className="template-repeat-head">
                    <h3>Học vấn</h3>
                    <button
                      type="button"
                      onClick={() => addItem("education")}
                      disabled={form.education.length >= 20}
                    >
                      + Thêm mục
                    </button>
                  </div>
                  {form.education.map((item, index) => (
                    <div className="template-repeat-item" key={index}>
                      <div className="template-repeat-head">
                        <strong>Mục {index + 1}</strong>
                        <button
                          type="button"
                          onClick={() => removeItem("education", index)}
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="template-form-grid">
                        {[
                          ["school", "Trường"],
                          ["degree", "Bằng cấp"],
                          ["startDate", "Bắt đầu"],
                          ["endDate", "Kết thúc"],
                          ["description", "Mô tả"],
                        ].map(([key, label]) => (
                          <label
                            key={key}
                            className={key === "description" ? "full" : ""}
                          >
                            {label}
                            {key === "description" ? (
                              <textarea
                                value={item[key]}
                                onChange={(e) =>
                                  updateItem(
                                    "education",
                                    index,
                                    key,
                                    e.target.value,
                                  )
                                }
                                maxLength={2000}
                                rows={3}
                              />
                            ) : (
                              <input
                                value={item[key]}
                                onChange={(e) =>
                                  updateItem(
                                    "education",
                                    index,
                                    key,
                                    e.target.value,
                                  )
                                }
                                maxLength={
                                  key === "school"
                                    ? 150
                                    : key.includes("Date")
                                      ? 30
                                      : 120
                                }
                                placeholder={
                                  key.includes("Date") ? "YYYY-MM" : undefined
                                }
                              />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSection("skills") && (
                <label className="template-skills-label">
                  Kỹ năng{" "}
                  <small>
                    Ngăn cách bằng dấu phẩy hoặc xuống dòng, tối đa 50 kỹ năng
                  </small>
                  <textarea
                    value={form.skills}
                    onChange={(e) => update("skills", e.target.value)}
                    rows={3}
                    placeholder="Java, Spring Boot, SQL"
                  />
                </label>
              )}
              {saveError && (
                <p className="template-error" role="alert">
                  {saveError}
                </p>
              )}
              <div className="template-form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Đang tạo PDF…" : "Lưu CV và xuất PDF"}
                </button>
              </div>
            </form>
          ) : (
            <div className="template-result" role="status">
              <h3>CV đã được tạo thành công</h3>
              <p>{createdCv.title} đã được lưu vào CV của tôi.</p>
              {pdfError && (
                <p className="template-error" role="alert">
                  {pdfError}{" "}
                  <button type="button" onClick={() => loadPdf(createdCv._id)}>
                    Thử mở lại
                  </button>
                </p>
              )}
              {pdfUrl && (
                <iframe title={`Xem trước ${createdCv.title}`} src={pdfUrl} />
              )}
              <div className="template-result-actions">
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    download={createdCv.source?.fileName || "cv.pdf"}
                  >
                    Tải PDF
                  </a>
                )}
                <Link to="/candidate/profile?tab=resumes">Về CV của tôi</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default TemplateCvBuilder;
