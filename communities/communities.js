import { fetchCommunities, fetchUserCommunities } from '../main/communities.mjs';
const token = localStorage.getItem('token');

async function renderFormContent() {
    const communities = await fetchCommunities();
    const myCommunities = await fetchUserCommunities(token);
    const formContainer = document.querySelector(".form");
    formContainer.innerHTML = ""; 

    if (communities && communities.length > 0) {
        communities.forEach(async (community) => {
            const communityElement = document.createElement("div");
            communityElement.classList.add("community");
            communityElement.innerHTML = `
                <a><h2 class="title" data-id=${community.id}>${(community.name).replace(/['"]+/g, '')} </h2></a>
            `;

            formContainer.appendChild(communityElement);

            if (Array.isArray(myCommunities)) {
                const userCommunity = myCommunities.find(
                    (myCommunity) => myCommunity.communityId === community.id
                );

                const button = document.createElement("button");

                if (!userCommunity) {
                    button.classList.add("sub-btn");
                    button.textContent = "Подписаться";
                    button.addEventListener("click", async (event) => {
                        event.preventDefault();
                        const success = await subscribeCommunity(community.id, token);
                        if (success) {
                            renderFormContent();
                        }
                    });
                } else {
                    const isAdministrator = userCommunity.role === "Administrator";
                    if (!isAdministrator) {
                        button.classList.add("unsub-btn");
                        button.textContent = "Отписаться";
                        button.addEventListener("click", async (event) => {
                            event.preventDefault();
                            const success = await unsubscribeCommunity(community.id, token);
                            if (success) {
                                renderFormContent(); 
                            }
                        });
                    }
                }

                communityElement.appendChild(button);
            }
        });
    } else {
        formContainer.innerHTML = "<p>Нет групп для отображения.</p>";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await renderFormContent();
    } catch (error) {
        console.error("Ошибка при загрузке групп", error.message);
    }
});

export async function subscribeCommunity(communityId, token) {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/community/${communityId}/subscribe`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    accept: "application/json",
                },
            }
        );
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ошибка при подписке. Статус:", response.status, "Ответ:", errorText);
            return false;
        }
        console.log("Подписка выполнена успешно!");
        return true;
    } catch (error) {
        console.error("Ошибка при запросе на подписку:", error.message);
        return false;
    }
}

export async function unsubscribeCommunity(communityId, token) {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/community/${communityId}/unsubscribe`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ошибка отписки. Статус:", response.status, "Ответ:", errorText);
            return false;
        }
        console.log("Отписка выполнена успешно!");
        return true;
    } catch (error) {
        console.error("Ошибка при запросе на отписку:", error.message);
        return false;
    }
}
document.addEventListener("click", async (e) => {
    const title = e.target.closest(".title");
    if (title) {
        const communityId = title.dataset.id;
        localStorage.setItem('communityId', communityId);

        window.location.href = '../communityPage/communityPage.html';
        return;
    }
});