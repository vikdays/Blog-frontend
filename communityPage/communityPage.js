import { fetchCommunityId, fetchUserCommunities } from '../main/communities.mjs';
import { renderPosts } from '../main/post.mjs';
import { paginateCommunity, changeCommunityPage } from './paginate.mjs';
import { subscribeCommunity, unsubscribeCommunity } from '../communities/communities.js';
const token = localStorage.getItem('token');
const communityId = localStorage.getItem('communityId');

async function renderCommunity() {

    let myCommunities;
    if (token){
        myCommunities = await fetchUserCommunities(token);
    } 
    const communityId = localStorage.getItem('communityId');
    const community = await fetchCommunityId(communityId);
    const communityContainer = document.querySelector(".container-community");

    communityContainer.innerHTML = "";

    if (community) {
        let isUserSubscribed, userRole, isAdmin;
        if (myCommunities) {
            isUserSubscribed  = myCommunities.some(userCommunity => userCommunity.communityId === community.id);
            userRole = myCommunities.find(userCommunity => userCommunity.communityId === community.id)?.role;
            isAdmin = userRole === "Administrator";
        }
        
        communityContainer.innerHTML = `
             <div class="container-community-title">
                <a><h1>Группа "${community.name}"</h1></a>
                <div class="container-community-title-btn">
                    ${isAdmin ? `<button class="create-btn" id="create-btn">Написать пост</button>` : ''}
                    
                    ${!isAdmin
                        ? isUserSubscribed
                            ? `<button class="sub-btn" id="unsub-btn">Отписаться</button>`
                            : `<button class="sub-btn" id="sub-btn">Подписаться</button>`
                        : ''}
                </div>
            </div>
            <div class="count-subs">
                <img src="../images/people.png" alt="people" id="people"> 
                <label>${community.subscribersCount} подписчиков</label></div>
            <div class="is-closed">Тип сообщества: ${community.isClosed ? "закрытое" : "открытое"}</div>
            <div class="container-community-admins">
                <h2>Администраторы</h2>
                <div class="admins">
                ${community.administrators.map(admin => `
                     <div class="admin-item">
                        <img src="../images/${admin.gender === "Male" ? "man.png" : "woman.png"}" alt="${admin.gender}" class="admin-avatar"> 
                        <h3 class="title">${admin.fullName}</h3>
                   </div>
                `).join('')}
                </div>
            </div>
        </div>
        `;
    } else {
        communityContainer.innerHTML = "<p>Нет постов для отображения.</p>";
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    try {
        await renderCommunity();
    } catch (error) {
        console.error("Ошибка при загрузке групп", error.message);
    }
    const { page, size } = {page: 1, size: 5}

    const filters = {
        size,
        page,
    };

    const getCurrentPage = () => {
        const activeButton = document.querySelector('a.active');
        return activeButton ? parseInt(activeButton.value, 10) || 1 : 1;
    };
    const loadPage = async () => {
        const page = getCurrentPage();
        try {
           
            changeCommunityPage(page, filters, token, communityId);
            const { posts, pagination } = await fetchPostsCommunity(filters, token, communityId);
            renderPosts(posts);
            paginateCommunity(pagination, filters, token);
        } catch (error) {
            console.error("Ошибка при загрузке постов:", error.message);
        }
    };
    loadPage();

    document.addEventListener('click', (event) => {
        if (event.target.tagName === 'a' && event.target.classList.contains('active')) {
            loadPage(); 
        }
    });
});
export async function fetchPostsCommunity(filters = {}, token = null, communityId) {
    if (!communityId) {
        console.error('Ошибка: communityId отсутствует.');
        return { posts: [], pagination: { size: 0, count: 0, current: 1 } };
    }

    const baseUrl = `https://blog.kreosoft.space/api/community/${communityId}/post`;
    const params = new URLSearchParams();
    params.append("page", filters.page || 1);
    params.append("size", filters.size || 5);
    if (filters.postSorting) params.append("sorting", filters.postSorting);
    if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append("tags", tag)); 
    }

    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Формируемый URL:', url);

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error(`Ошибка: ${response.status} - ${response.statusText}. Тело ответа: ${errorText}`);
            throw new Error(`Ошибка загрузки постов: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Ошибка при запросе постов:", error.message);
        return { posts: [], pagination: { size: 0, count: 0, current: 1 } };
    }
}

export function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        page: parseInt(params.get('page'), 10) || 1,
        size:  parseInt(params.get('pageSize'), 10) || 1,
    }
}

document.getElementById("do-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const { page, size } = getURLParams();

    const filters = {
        tags: Array.from(document.getElementById("tags").selectedOptions).map(option => option.value),
        size: parseInt(document.getElementById("size").value, 10) || size,
        page,
        postSorting: document.getElementById("postSorting").value,
    };
    const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('page', page);
        urlParams.set('pageSize', filters.size);
        history.pushState(null, '', `?${urlParams.toString()}`);

    try {
        const { posts, pagination } = await fetchPostsCommunity(filters, token, communityId);
        renderPosts(posts); 
        paginateCommunity(pagination, filters, token);
    } catch (error) {
        console.error("Ошибка при загрузке постов:", error.message);
    }
});

document.addEventListener("click", async (event) => {
    const button = event.target;

    if (button.classList.contains("sub-btn")) {
        event.preventDefault();
        console.log(communityId);
        console.log(token);
        let success = false;

        if (button.id === "sub-btn") {
            
            success = await subscribeCommunity(communityId, token);
            console.log('sub')
        } else if (button.id === "unsub-btn") {
            success = await unsubscribeCommunity(communityId, token);
        }

        if (success) {
            window.location.reload();
        } else {
            console.error("Не удалось выполнить действие");
        }
    }
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("show-more-btn")) {
        e.preventDefault();

        const button = e.target;
        const postDescription = button.parentElement;
        const shortDescription = postDescription.querySelector('.short-description');
        const fullDescription = postDescription.querySelector('.full-description'); 

        if (shortDescription && fullDescription) {
            shortDescription.style.display = "none";
            fullDescription.style.display = "block";
            button.remove();
        }
    }
});



document.addEventListener("click", async (e) => {
    localStorage.removeItem('postId');
    const title = e.target.closest(".post-title");
    if (title) {
        const postId = title.dataset.id; 
        localStorage.setItem('postId', postId);
        window.location.href = '../postPage/postPage.html'; 
        return;
    }
    
    const commentIcon = e.target.closest(".comment");
    if (commentIcon) {
        const postId = commentIcon.dataset.id;
        console.log("postId (комментарии)", postId);
        localStorage.setItem('postId', postId);

        window.location.href = '../postPage/postPage.html#comments-section';
        return;
    }
});

document.addEventListener("click", async (event) => {
    const button = event.target.closest(".image-button");
    if (!button) return;

    const postId = button.dataset.id; 
    const img = button.querySelector("img");
    const communityId = button.dataset.communityId;
    console.log('communityId', communityId);
    const likesCountElement = button.parentElement.querySelector("#likes-count");

    if (!likesCountElement) return; 
    let likesCount = parseInt(likesCountElement.textContent, 10) || 0; 

    if (!token) {
        console.error("User is not authorized. Redirecting to login...");
        alert("Чтобы оценить пост необходимо авторизоваться.");
        return;
    }
    console.log(communityId)


    if (!communityId) { //!
        const canLike = await canUserLike(communityId, token);
        if (!canLike) {
            alert("Вы должны быть подписчиком или администратором, чтобы оценить этот пост.");
            return;
        }
    }

    if (img.alt === "heart") {
        const success = await likePost(postId, token); 
        if (success) {
            img.src = "../images/love.png";
            img.alt = "love";
            likesCountElement.textContent = likesCount + 1;
        }
        else{
            alert('Необходимо авторизоваться');
        }
    } else if (img.alt === "love") {
        const success = await dislikePost(postId, token);
        if (success) {
            img.src = "../images/heart.png";
            img.alt = "heart";
            likesCountElement.textContent = likesCount - 1;
        }
        else{
            alert('Необходимо авторизоваться');

        }
    }
});
