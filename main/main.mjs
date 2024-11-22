import { PostSorting } from './PostSorting.mjs';
import { renderPosts } from './post.mjs';
import { fetchPosts } from './post.mjs';
import { likePost } from './post.mjs';
import { dislikePost } from './post.mjs';
import { fetchPostDetails } from './post.mjs';


const email = localStorage.getItem('userEmail');
const token = localStorage.getItem('token');
const userEmail = document.getElementById('user-email');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutButton = document.getElementById('logout');
const profileButton = document.getElementById('profile');
let posts = []

document.getElementById("logout").addEventListener("click", async (event) => {
    const response = await fetch('https://blog.kreosoft.space/api/account/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    localStorage.clear();
    window.location.href = '../authorization/authorization.html'; 
    console.log(response)
}
)

document.getElementById("profile").addEventListener("click", async (event) => {
    window.location.href = '../profile/profile.html'; 
})

if (userEmail) {
    userEmail.textContent = email;
} else {
    userEmail.textContent = 'Вход';
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

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (token) {
        console.log("Пользователь авторизован. Загружаем посты с токеном...");
        try {
            const data = await fetchPosts({}, token); 
            if (data && data.posts) {
                renderPosts(data.posts); 
            }
        } catch (error) {
            console.error("Ошибка при загрузке постов:", error.message);
        }
    } else {
        console.log("Пользователь не авторизован. Загружаем публичные посты...");
        try {
            const data = await fetchPosts(); 
            if (data && data.posts) {
                renderPosts(data.posts); 
            }
        } catch (error) {
            console.error("Ошибка при загрузке постов:", error.message);
        }
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
        page: 1, 
    };

    const data = await fetchPosts(filters);
    if (data) {
        renderPosts(data.posts);
    }
});
document.addEventListener("click", async (event) => {
    const button = event.target.closest(".image-button");
    if (!button) return;

    const postId = button.dataset.id; 
    const img = button.querySelector("img");

    if (!token) {
        console.error("User is not authorized. Redirecting to login...");
        window.location.href = "../authorization/authorization.html";
        return;
    }

    if (img.alt === "heart") {
        const success = await likePost(postId, token); 
        if (success) {
            img.src = "../images/love.png";
            img.alt = "love";
        }
    } else if (img.alt === "love") {
        const success = await dislikePost(postId, token);
        if (success) {
            img.src = "../images/heart.png";
            img.alt = "heart";
        }
    }
});