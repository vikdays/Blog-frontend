const postId = localStorage.getItem('postId');
const token = localStorage.getItem('token');
const email = localStorage.getItem('userEmail');
const userEmail = document.getElementById('user-email');
import { fetchAddress, getAddressId } from './address.mjs';
import { likePost, dislikePost } from '../main/post.mjs';
import { renderComments, postComment } from './comments.mjs';

export async function fetchPost(postId, token = null) {
    console.log(postId, token);

    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response =  await fetch(`https://blog.kreosoft.space/api/post/${postId}`, { headers });

    if (!response.ok) {
        console.error("Не удалось получить данные о посте");
        return null;
    }

    const postData = await response.json();
    return postData;
}


export async function renderPost(post) {
    const postsContainer = document.querySelector(".container-posts");
    postsContainer.innerHTML = "";

    if (post) {
        console.log('post-desc', post)
        const postElement = document.createElement("div");
        postElement.classList.add("container-posts");
        if (post.addressId !== null) {
            var formattedAddress = await fetchAddress(post.addressId);
        }
        

        postElement.innerHTML = `
            <div class="container-posts-body">
                <div class="upper">
                    <div class="pretitle">${post.author} - ${new Date(post.createTime).toLocaleString()} в сообществе "${post.communityName ? post.communityName : "415"}"</div>
                    <a> <h2 class="post-title" data-id=${post.id}>${post.title}</h2> </a>
                </div>
                <div class="down">
                    <div class="post-img">
                        <img id="post-img" 
                            src="${post.image ? post.image : " "}" 
                        >
                    </div>
                    <div class="post-description">
                        <span class="short-description">${post.description}</span>
                    </div>
                    <div class="post-tags">#${post.tags.map(tag => tag.name).join(" #")}</div>
                    <div class="post-time">Время чтения: ${post.readingTime} мин.</div>
                    <div class="post-geo">
                        <img src="../images/geo.png" alt="geo" id="geo">
                        <div >${formattedAddress ? formattedAddress : ""}</div>
                    </div>
                </div>
            </div>
            <div class="container-posts-footer">
                <div class="container-posts-comment">
                    <div id="comments-count">${post.commentsCount}</div>
                    <img src="../images/comment.png" alt="comment" id="comment">
                </div>
                <div class="container-posts-likes">
                    <div id="likes-count">${post.likes}</div>
                        <button class="image-button" data-id=${post.id} data-community-id=${post.communityId}>
                        <img id="like" class="like-img"
                            src="${post.hasLike ? "../images/love.png" : "../images/heart.png"}" 
                            alt="${post.hasLike ? "love" : "heart"}" 
                        >
                    </button>
                </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
        
    } else {
        postsContainer.innerHTML = "<p>Нет постов для отображения.</p>";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const post = await fetchPost(postId, token);
        console.log('hi', post);
        await renderPost(post);
        if (post.comments) {
            await renderComments(post);
        }
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
        window.location.href = "../authorization/authorization.html";
        return;
    }
    console.log(communityId)

    if (!communityId) {
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
    } else if (img.alt === "love") {
        const success = await dislikePost(postId, token);
        if (success) {
            img.src = "../images/heart.png";
            img.alt = "heart";
            likesCountElement.textContent = likesCount - 1;
        }
    }
});

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

document.getElementById("send-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const parentId = null;
    const content = document.getElementById('textarea').value;
    const data = {content, parentId}
    console.log(data);
    try {
        await postComment(data, postId, token);
        window.location.href = './postPage.html';
        
    } catch (error) {
        console.error('Error:', error.message);
    }
});



