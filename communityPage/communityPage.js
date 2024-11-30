import { fetchCommunityId, fetchCommunities, fetchUserCommunities } from '../main/communities.mjs';
const token = localStorage.getItem('token');
const communityId = localStorage.getItem('communityId');

async function renderCommunity() {
    const myCommunities = await fetchUserCommunities(token);
    const community = await fetchCommunityId(communityId);
    const communityContainer = document.querySelector(".container");
    communityContainer.innerHTML = "";

    if (community) {
        const isUserSubscribed = myCommunities.some(userCommunity => userCommunity.communityId === community.id);
        const userRole = myCommunities.find(userCommunity => userCommunity.communityId === community.id)?.role;
        const isAdmin = userRole === "Administrator";
        const communityElement = document.createElement("div");
        communityElement.classList.add("container-community");
        communityElement.innerHTML = `
             <div class="container-community-title">
                <h1>Группа "${community.name}"</h1>
                <div class="container-community-title-btn">
                    ${isAdmin ? `<button class="create-btn" id="create-btn">Написать пост</button>` : ''}
                    
                    ${!isAdmin
                        ? isUserSubscribed
                            ? `<button class="unsub-btn" id="unsub-btn">Отписаться</button>`
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
        communityContainer.appendChild(communityElement);
        
    } else {
        communityContainer.innerHTML = "<p>Нет постов для отображения.</p>";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await renderCommunity();
    } catch (error) {
        console.error("Ошибка при загрузке групп", error.message);
    }
});