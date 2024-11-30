import { PostSorting } from './PostSorting.mjs';
import { renderPosts } from './post.mjs';
import { fetchPosts } from './post.mjs';
import { likePost } from './post.mjs';
import { dislikePost } from './post.mjs';
import { getURLParams } from './post.mjs';
import { changePage } from './pagination.mjs';
import { paginate} from './pagination.mjs';
import { canUserLike, fetchCommunityId} from './communities.mjs';
import {fetchCommunities} from './communities.mjs';

const email = localStorage.getItem('userEmail');
const token = localStorage.getItem('token');
const userEmail = document.getElementById('user-email');
const dropdownMenu = document.getElementById('dropdownMenu');
const dropdownArrow = document.getElementById('dropdownArrow');

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

document.getElementById("post-btn").addEventListener("click", async (e) => {
    if (token) {
        window.location.href = '../createPost/createPost.html'; 
    }
    else{
        alert('Чтобы написать пост необходимо авторизоваться');
    }
});

if (userEmail) {
    userEmail.textContent = email || 'Вход';
} else {
    console.error('email not found in localStorage');

}
if (userEmail.textContent === email) {
    userEmail.addEventListener('click', () => {
        dropdownMenu.classList.toggle('visible');
    });
}
else{
    dropdownArrow.style.display = "none";
    userEmail.addEventListener('click', () => {
        window.location.href = '../authorization/authorization.html'; 
    });
}


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

    const { page, size } = getURLParams();

    const filters = {
        author: document.getElementById("author").value,
        tags: Array.from(document.getElementById("tags").selectedOptions).map(option => option.value),
        min: document.getElementById("min").value,
        max: document.getElementById("max").value,
        onlyMyCommunities: document.getElementById("onlyMineCommunities").checked,
        size: parseInt(document.getElementById("size").value, 10) || size,
        page,
        postSorting: document.getElementById("postSorting").value,
    };
    const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('page', page);
        urlParams.set('pageSize', filters.size);
        history.pushState(null, '', `?${urlParams.toString()}`);

    try {
        console.log("tag", filters.tags);
        const { posts, pagination } = await fetchPosts(filters, token);
        renderPosts(posts); 
        paginate(pagination, filters, token);
    } catch (error) {
        console.error("Ошибка при загрузке постов:", error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
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
            changePage(page, filters, token);
            const { posts, pagination } = await fetchPosts(filters, token);
            renderPosts(posts);
            paginate(pagination, filters, token);
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
        window.location.href = "../authorization/authorization.html";
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
            window.location.href = "../authorization/authorization.html";
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
            window.location.href = "../authorization/authorization.html";
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
        const communityId = title.dataset.communityId;
        if (communityId) {
            try {
                const data = await fetchCommunityId(communityId);
                if (data && data.isClosed) {
                    alert('Вы не можете просматривать пост закрытой группы');
                    return; 
                }
            } catch (error) {
                console.error("Ошибка проверки группы:", error.message);
                alert('Произошла ошибка при проверке группы. Повторите попытку позже.');
                return; 
            }
        }
        localStorage.setItem('postId', postId);
        window.location.href = '../postPage/postPage.html'; 
        return;
    }
    
    const commentIcon = e.target.closest(".comment");
    if (commentIcon) {
        const postId = commentIcon.dataset.id;
        const communityId = commentIcon.dataset.communityId;
        if (communityId) {
            try {
                const data = await fetchCommunityId(communityId);
                if (data && data.isClosed) {
                    alert('Вы не можете просматривать пост закрытой группы');
                    return;
                }
            } catch (error) {
                console.error("Ошибка проверки группы:", error.message);
                alert('Произошла ошибка при проверке группы. Повторите попытку позже.');
                return; 
            }
        }
        console.log("postId (комментарии)", postId);
        localStorage.setItem('postId', postId);

        window.location.href = '../postPage/postPage.html#comments-section';
        return;
    }
});

