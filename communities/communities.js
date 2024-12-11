import { fetchCommunities, fetchUserCommunities } from '../main/communities.mjs';
import '../profile/dropdownMenu.mjs';
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

            const a = document.createElement("a");
            const title = document.createElement("h2");
            title.classList.add("title");
            title.dataset.id = community.id;
            title.textContent = (community.name).replace(/['"]+/g, '');
            a.appendChild(title);
            communityElement.appendChild(a);

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
        const noPostsMessage = document.createElement("p");
        noPostsMessage.textContent = "Нет групп для отображения.";
        formContainer.appendChild(noPostsMessage);
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

