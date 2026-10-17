// Gọi API tìm kiếm ciệc làm từ backend

export const searchJobsApi = async ({
    keyword = '',
    profession = '',
    location = 0,
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

    const respone = await fetch(`/api/jobs/search${queryParam.toString()}`, {
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