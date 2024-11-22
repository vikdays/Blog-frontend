import { PostSorting } from './PostSorting.mjs';
import { renderPosts } from './post.mjs';
import { fetchPosts } from './post.mjs';

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
    console.log(response)
}
)
document.getElementById("profile").addEventListener("click", async (event) => {
    window.location.href = '../profile/profile.html'; 
})
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


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await fetchPosts(); 
        if (data) {
            renderPosts(data.posts); 
        } else {
            console.error('Не удалось загрузить посты');
        }
    } catch (error) {
        console.log(error.message);
        console.error('Ошибка при загрузке постов:', error);
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
        //renderPagination(data.pagination);
    }
});