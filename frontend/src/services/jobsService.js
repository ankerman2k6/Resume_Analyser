// Gọi API tìm kiếm ciệc làm từ backend

export const searchJobsApi = async ({
    keyword = '',
    profession = '',
    location = '',
    page = 0,
    size = 10
} = {}) => {
    //Xay dung query string
    const queryParam = new URLSearchParams();

    if(keyword && keyword.trim()){
        queryParam.append('keyword', keyword.trim());
    }

    if(profession && profession.trim()){
        queryParam.append('profession', profession.trim());
    }

    if(location && location.trim()){
        queryParam.append('location', location.trim());
    }
    queryParam.append('page', page)
    queryParam.append('size', size)

    const queryString = queryParam.toString();
    const url = queryString ? `/api/jobs/search?${queryString}` : '/api/jobs/search';

    const respone = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(!respone.ok){
        const errorData = await respone.json().catch(() => ({}));
        throw new Error(errorData.message || 'Khong the tai danh sach viec lam')
    }

    return await respone.json();


}

// API nhận dữ liệu chi tiết của một job từ backend: GET /api/jobs/{id}.
// Hàm này chỉ gọi và trả JSON; việc hiển thị dữ liệu nằm ở JobDetail.jsx.
export const getJobDetailApi = async (jobId) => {
    const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể tải chi tiết việc làm');
    }

    return await response.json();
};

// API nhận dữ liệu công ty theo companyId: GET /api/companies/{id}.
// Hàm này phục vụ cả card công ty trong JobDetail và trang CompanyDetail.
export const getCompanyDetailApi = async (companyId) => {
    const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể tải thông tin công ty');
    }

    return await response.json();
};
