import { PostSorting } from './PostSorting.mjs';
import { renderPosts } from './post.mjs';
import { fetchPosts } from './post.mjs';
import { likePost } from './post.mjs';
import { dislikePost } from './post.mjs';
import { paginate} from './pagination.mjs';

const email = localStorage.getItem('userEmail');
const token = localStorage.getItem('token');
const userEmail = document.getElementById('user-email');
const dropdownMenu = document.getElementById('dropdownMenu');

document.getElementById("logout").addEventListener("click", async (event) => {
    const response = await fetch('https://blog.kreosoft.space/api/account/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    localStorage.clear();
    window.location.href = '../authorization/authorization.html'; 
})

document.getElementById("profile").addEventListener("click", async (event) => {
    window.location.href = '../profile/profile.html'; 
})

if (userEmail) {
    userEmail.textContent = email || 'Вход';
} else {
    console.error('email not found in localStorage');

}
userEmail.addEventListener('click', () => {
    dropdownMenu.classList.toggle('visible');
});

document.addEventListener('DOMContentLoaded', () => {
    const postSortingSelect = document.getElementById('postSorting');

    if (postSortingSelect) {
        Object.entries(PostSorting).forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            postSortingSelect.appendChild(option);
        });
    } else {
        console.error('Select element for sorting not found');
    }
});

document.getElementById("do-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const filters = {
        author: document.getElementById("author").value,
        tags: Array.from(document.getElementById("tags").selectedOptions).map(option => option.value),
        min: document.getElementById("min").value,
        max: document.getElementById("max").value,
        onlyMyCommunities: document.getElementById("onlyMineCommunities").checked,
        size: document.getElementById("size").value,
        page: document.querySelector('button.active')?.value,
        postSorting: document.getElementById("postSorting").value,
    };

    try {
        const data = await fetchPosts(filters, token);
        if (data && data.posts) {
            renderPosts(data.posts);
            paginate(data.pagination, filters, token);
        } else {
            console.error("Нет данных для отображения.");
        }
    } catch (error) {
        console.error("Ошибка при загрузке постов:", error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const sizeElement = document.getElementById('size');
    const pageSize = sizeElement ? parseInt(sizeElement.value, 10) || 5 : 5;

    const getCurrentPage = () => {
        const activeButton = document.querySelector('button.active');
        return activeButton ? parseInt(activeButton.value, 10) || 1 : 1;
    };
    const loadPage = async () => {
        const page = getCurrentPage();
        try {
            const { posts, pagination } = await fetchPosts({ size: pageSize, page }, token);
            renderPosts(posts);
            paginate(pagination, { size: pageSize, page }, token);
        } catch (error) {
            console.error("Ошибка при загрузке постов:", error.message);
        }
    };
    loadPage();

    document.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('active')) {
            loadPage(); 
        }
    });
});

document.addEventListener("click", async (event) => {
    const button = event.target.closest(".image-button");
    if (!button) return;

    const postId = button.dataset.id; 
    const img = button.querySelector("img");
    const likesCountElement = button.parentElement.querySelector("#likes-count");

    if (!likesCountElement) return; 
    let likesCount = parseInt(likesCountElement.textContent, 10) || 0; 

    if (!token) {
        console.error("User is not authorized. Redirecting to login...");
        alert("Чтобы оценить пост необходимо авторизоваться.");
        window.location.href = "../authorization/authorization.html";
        return;
    }

    if (img.alt === "heart") {
        const success = await likePost(postId, token); 
        if (success) {
            img.src = "../images/love.png";
            img.alt = "love";
            likesCountElement.textContent = likesCount + 1;
        }
    } else if (img.alt === "love") {
        const success = await dislikePost(postId, token);
        if (success) {
            img.src = "../images/heart.png";
            img.alt = "heart";
            likesCountElement.textContent = likesCount - 1;
        }
    }
});