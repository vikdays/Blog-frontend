import { renderPosts } from './post.mjs';
import { fetchPosts } from './post.mjs';
import { likePost } from './post.mjs';
import { dislikePost } from './post.mjs';
import { createPagination} from './pagination.mjs';
import { canUserLike} from './communities.mjs';
import '../profile/dropdownMenu.mjs';

const token = localStorage.getItem('token');

document.getElementById("post-btn").addEventListener("click", async (e) => {
    if (token) {
        window.location.href = '../createPost/createPost.html'; 
    }
    else{
        alert('Чтобы написать пост необходимо авторизоваться');
    }
});
document.getElementById("do-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    const filters = {
        tags: Array.from(document.getElementById("tags").selectedOptions).map(option => option.value).filter(Boolean),
        author: document.getElementById("author").value.trim(),
        postSorting: document.getElementById("postSorting").value,
        onlyMyCommunities: document.getElementById("onlyMineCommunities").checked,
        min: document.getElementById("min").value,
        max: document.getElementById("max").value,
        size: parseInt(document.getElementById("size").value, 10) || 5,
        page: 1,
    };

    const urlParams = new URLSearchParams(filters);
    history.pushState(null, '', `?${urlParams.toString()}`);

    try {
        const { posts, pagination } = await fetchPosts(filters, token);
        renderPosts(posts);
        paginate(pagination, filters, token);
    } catch (error) {
        console.error("Ошибка при загрузке постов:", error.message);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {
        tags: urlParams.getAll('tags'),
        author: urlParams.get('author') || '',
        postSorting: urlParams.get('sorting') || 'CreateDesc',
        onlyMyCommunities: urlParams.get('onlyMyCommunities') === 'true',
        min: document.getElementById("min").value,
        max: document.getElementById("max").value,
        page: parseInt(urlParams.get('page'), 10) || 1,
        size: parseInt(urlParams.get('size'), 10) || 5,
    };

    try {
        const { posts, pagination } = await fetchPosts(filters, token);
        renderPosts(posts);
        paginate(pagination, filters, token);
    } catch (error) {
        console.error("Ошибка при загрузке постов:", error.message);
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
    localStorage.removeItem('communityId');
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


export function paginate(pagination, filters, token) {
    createPagination(pagination, filters, token, (page) => {
        changePage(page, filters, token);
    });
}

export async function changePage(page, filters, token) {
    try {
        filters.page = page;

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('page', page);
        urlParams.set('size', filters.size);
        history.pushState(null, '', `?${urlParams.toString()}`);

        const { posts, pagination } = await fetchPosts(filters, token);
        renderPosts(posts);
        window.scrollTo({ top: 0, behavior: 'smooth' })
        paginate(pagination, filters, token);
    } catch (error) {
        console.error('Ошибка при переключении страницы:', error.message);
    }
}