import { fetchCommunityId, fetchUserCommunities } from '../main/communities.mjs';
import { renderPosts } from '../main/post.mjs';
import { createPagination } from '../main/pagination.mjs';
import { subscribeCommunity, unsubscribeCommunity } from '../communities/communities.js';
import '../profile/dropdownMenu.mjs';
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
        
        const communityTitle = document.createElement("div");
        communityTitle.classList.add("container-community-title");

        const communityName = document.createElement("h1");
        communityName.textContent = `Группа "${community.name}"`;

        const communityTitleBtn = document.createElement("div");
        communityTitleBtn.classList.add('container-community-title-btn');

        if (isAdmin) {
            const createBtn = document.createElement("button");
            createBtn.classList.add("create-btn");
            createBtn.id = "create-btn";
            createBtn.textContent = "Написать пост";

            communityTitleBtn.appendChild(createBtn);
        }
        else{
            if (isUserSubscribed) {
                const subBtn = document.createElement('button');
                subBtn.classList.add("sub-btn");
                subBtn.id = "unsub-btn";
                subBtn.textContent = "Отписаться";
                communityTitleBtn.appendChild(subBtn);
            }
            else{
                const subBtn = document.createElement('button');
                subBtn.classList.add("sub-btn");
                subBtn.id = "sub-btn";
                subBtn.textContent = "Подписаться";
                communityTitleBtn.appendChild(subBtn);
            }   
        }
        communityTitle.appendChild(communityName);
        communityTitle.appendChild(communityTitleBtn);

        const countSubs = document.createElement("div");
        countSubs.classList.add("count-subs");

        const subsImg = document.createElement("img");
        subsImg.src = "../images/people.png";
        subsImg.alt = "people";
        subsImg.id = "people";

        const label = document.createElement("label");
        label.textContent = `${community.subscribersCount} подписчиков`;

        countSubs.appendChild(subsImg);
        countSubs.appendChild(label);

        const isClosed = document.createElement("div");
        isClosed.classList.add("is-closed");
        if (community.isClosed) {
            isClosed.textContent = "Тип сообщества: закрытое";
        }
        else{
            isClosed.textContent = "Тип сообщества: открытое";
        }

        const communityAdmins = document.createElement("div");
        communityAdmins.classList.add("container-community-admins");
        const h2 = document.createElement("h2");
        h2.textContent = "Администраторы";

        const admins = document.createElement("div");
        admins.classList.add("admins");
        admins.innerHTML = `${community.administrators.map(admin => `
            <div class="admin-item">
               <img src="../images/${admin.gender === "Male" ? "man1.png" : "women1.png"}" alt="${admin.gender}" class="admin-avatar"> 
               <h3 class="title">${admin.fullName}</h3>
          </div>
       `).join('')}`;

       communityAdmins.appendChild(h2);
       communityAdmins.appendChild(admins);

       communityContainer.appendChild(communityTitle);
       communityContainer.appendChild(countSubs);
       communityContainer.appendChild(isClosed);
       communityContainer.appendChild(communityAdmins);

        if (isAdmin) {
            document.getElementById("create-btn").addEventListener("click", async (e) => {
                if (token) {
                    window.location.href = '../createPost/createPost.html'; 
                }
            });
        }
    } else {
        communityContainer.innerHTML = "<p>Нет постов для отображения.</p>";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const select = document.getElementById('size');
    select.value = parseInt(urlParams.get('size'), 10) || 5;
    const filters = {
        tags: urlParams.getAll('tags'),
        sorting: urlParams.get('sorting') || 'CreateDesc',
        page: parseInt(urlParams.get('page'), 10) || 1,
        size: parseInt(urlParams.get('size'), 10) || 5,
    };

    try {
        await renderCommunity();
        const { posts, pagination } = await fetchPostsCommunity(filters, token, communityId);
        renderPosts(posts);
        paginateCommunity(pagination, filters, token);
        
    } catch (error) {
        console.error("Ошибка при загрузке групп", error.message);
    }
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
    if (filters.sorting) params.append("sorting", filters.sorting);
    if (filters.tags && filters.tags.length > 0) {
        filters.tags
            .filter(tag => tag.trim()) 
            .forEach(tag => params.append("tags", tag));
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


document.getElementById("do-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    const filters = {
        tags: Array.from(document.getElementById("tags").selectedOptions).map(option => option.value).filter(Boolean),
        size: parseInt(document.getElementById("size").value, 10) || size,
        page: 1,
        sorting: document.getElementById("postSorting").value,
    };
    const urlParams = new URLSearchParams(filters);
    history.pushState(null, '', `?${urlParams.toString()}`);

    try {
        const { posts, pagination } = await fetchPostsCommunity(filters, token, communityId);
        renderPosts(posts); 
        paginateCommunity(pagination, filters, token);
    } catch (error) {
        console.error("Ошибка при загрузке постов:", error.message);
    }
});

document.getElementById("size").addEventListener("change", async (e) => {
    const size = parseInt(e.target.value, 10) || 5;
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {
        tags: urlParams.getAll('tags'),
        postSorting: urlParams.get('sorting') || 'CreateDesc',
        page: 1,
        size: size,
    };
    const url = new URLSearchParams(filters);
    history.pushState(null, '', `?${url.toString()}`);
    try {
        const { posts, pagination } = await fetchPostsCommunity(filters, token, communityId);
        renderPosts(posts); 
        paginateCommunity(pagination, filters, token); 
    } catch (error) {
        console.error("Ошибка при изменении количества постов на странице:", error.message);
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
export function paginateCommunity(pagination, filters, token) {
    const communityId = localStorage.getItem('communityId');
    createPagination(pagination, filters, token, (page) => {
        changeCommunityPage(page, filters, token, communityId);
    });
}

export async function changeCommunityPage(page, filters, token, communityId) {
    try {
        filters.page = page;

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('page', page);
        urlParams.set('size', filters.size);
        history.pushState(null, '', `?${urlParams.toString()}`);

        const { posts, pagination } = await fetchPostsCommunity(filters, token, communityId);
        renderPosts(posts);
        window.scrollTo({ top: 0, behavior: 'smooth' })
        paginateCommunity(pagination, filters, token);
    } catch (error) {
        console.error('Ошибка при переключении страницы:', error.message);
    }
}